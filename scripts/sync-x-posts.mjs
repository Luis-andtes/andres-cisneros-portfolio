import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const token = process.env.X_BEARER_TOKEN;
const username = process.env.X_USERNAME || "cisnerosandress";
const outputPath = resolve("data/x-posts.json");
const postLimit = 6;
const pageSize = 25;
const pageLimit = 4;

if (!token) {
  throw new Error("Missing X_BEARER_TOKEN. Add it as a GitHub Actions repository secret.");
}

async function request(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`X API request failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function readCurrent() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return { username, userId: null, latestId: null, updatedAt: null, posts: [] };
  }
}

const current = await readCurrent();
let userId = current.userId;

if (!userId || current.username !== username) {
  const lookup = new URL(`https://api.x.com/2/users/by/username/${encodeURIComponent(username)}`);
  lookup.searchParams.set("user.fields", "id,name,username");
  const userPayload = await request(lookup);
  userId = userPayload.data?.id;
  if (!userId) throw new Error(`X user @${username} was not found.`);
}

const timelinePosts = [];
let paginationToken = null;

for (let page = 0; page < pageLimit; page += 1) {
  const timeline = new URL(`https://api.x.com/2/users/${userId}/tweets`);
  timeline.searchParams.set("max_results", String(pageSize));
  timeline.searchParams.set("exclude", "retweets");
  timeline.searchParams.set(
    "tweet.fields",
    "created_at,entities,note_tweet,public_metrics,referenced_tweets,conversation_id"
  );
  if (paginationToken) timeline.searchParams.set("pagination_token", paginationToken);

  const payload = await request(timeline);
  timelinePosts.push(...(payload.data || []));

  const rootCount = timelinePosts.filter((post) =>
    !(post.referenced_tweets || []).some((reference) => reference.type === "replied_to")
  ).length;

  paginationToken = payload.meta?.next_token || null;
  if (rootCount >= postLimit || !paginationToken) break;
}

const repliesIgnored = timelinePosts.filter((post) =>
  (post.referenced_tweets || []).some((reference) => reference.type === "replied_to")
).length;

const posts = timelinePosts
  .filter((post) =>
    !(post.referenced_tweets || []).some((reference) => reference.type === "replied_to")
  )
  .map((post) => ({
  id: post.id,
  username,
  text: post.note_tweet?.text || post.text,
  createdAt: post.created_at,
  url: `https://x.com/${username}/status/${post.id}`,
  conversationId: post.conversation_id || post.id,
  referencedTweets: post.referenced_tweets || [],
  isReply: false,
  metrics: {
    likes: post.public_metrics?.like_count || 0,
    reposts: post.public_metrics?.retweet_count || 0,
    replies: post.public_metrics?.reply_count || 0
  }
  }))
  .sort((a, b) => (BigInt(a.id) > BigInt(b.id) ? -1 : 1))
  .slice(0, postLimit);

const latestId = posts[0]?.id || current.latestId || null;
const output = {
  username,
  userId,
  latestId,
  updatedAt: new Date().toISOString(),
  posts
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  `Saved ${posts.length} root publication(s); ignored ${repliesIgnored} reply/continuation post(s).`
);
