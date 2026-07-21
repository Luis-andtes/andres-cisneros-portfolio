(() => {
  const grid = document.querySelector(".x-posts-grid");
  if (!grid) return;

  const copy = {
    en: {
      empty: "My latest publications will appear here after the first X synchronization.",
      error: "The publications could not be loaded right now.",
      view: "Read the original post",
      likes: "likes",
      reposts: "reposts"
    },
    es: {
      empty: "Mis publicaciones más recientes aparecerán aquí después de la primera sincronización con X.",
      error: "Las publicaciones no se pudieron cargar en este momento.",
      view: "Leer la publicación original",
      likes: "me gusta",
      reposts: "republicaciones"
    }
  };

  let posts = [];
  let failed = false;

  const language = () => document.documentElement.lang === "es" ? "es" : "en";

  function formatDate(value, lang) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function createPost(post, lang) {
    const article = document.createElement("article");
    article.className = "x-post-card";

    const top = document.createElement("div");
    top.className = "x-post-top";

    const author = document.createElement("span");
    author.textContent = `@${post.username || "cisnerosandress"}`;

    const time = document.createElement("time");
    time.dateTime = post.createdAt || "";
    time.textContent = formatDate(post.createdAt, lang);

    const body = document.createElement("p");
    body.className = "x-post-copy";
    body.textContent = post.text || "";

    const footer = document.createElement("div");
    footer.className = "x-post-footer";

    const metrics = document.createElement("span");
    const likes = Number(post.metrics?.likes || 0);
    const reposts = Number(post.metrics?.reposts || 0);
    metrics.textContent = `${likes} ${copy[lang].likes} · ${reposts} ${copy[lang].reposts}`;

    const link = document.createElement("a");
    link.href = post.url || `https://x.com/cisnerosandress/status/${post.id}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = `${copy[lang].view} ↗`;

    top.append(author, time);
    footer.append(metrics, link);
    article.append(top, body, footer);
    return article;
  }

  function render() {
    const lang = language();
    grid.replaceChildren();

    if (failed || !posts.length) {
      const status = document.createElement("p");
      status.className = "x-posts-status";
      status.textContent = failed ? copy[lang].error : copy[lang].empty;
      grid.append(status);
      return;
    }

    posts.slice(0, 9).forEach((post) => grid.append(createPost(post, lang)));
  }

  fetch("data/x-posts.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      posts = Array.isArray(payload.posts) ? payload.posts : [];
      render();
    })
    .catch(() => {
      failed = true;
      render();
    });

  window.addEventListener("portfolio:languagechange", render);
})();
