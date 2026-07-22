(() => {
  const grid = document.querySelector(".blog-post-grid");
  if (!grid) return;

  const translations = {
    en: {
      title: "Writing | Luis Andrés Cisneros",
      description: "Recent writing by Luis Andrés Cisneros on markets, investing, economics and building with intention.",
      skip: "Skip to content",
      portfolio: "Portfolio",
      followNav: "Follow on X ↗",
      archive: "Writing archive",
      updated: "Updated weekly through the X API",
      hero: "Ideas in <em>progress.</em>",
      heroCopy: "Notes on markets, investing, economics and the decisions behind building a life around capital allocation.",
      latestKicker: "Latest publications",
      latestTitle: "Recent notes.",
      count: "The six most recent posts",
      continueKicker: "Continue the conversation",
      continueTitle: "Follow the thinking in real time.",
      continueCopy: "New notes are published first on X. Follow me there for every publication, market observation and idea that is still taking shape.",
      followAction: "Follow @cisnerosandress <span aria-hidden=\"true\">↗</span>",
      allAction: "View all publications <span aria-hidden=\"true\">↗</span>",
      back: "← Back to portfolio",
      empty: "The latest publications will appear here after the next synchronization with X.",
      error: "The publications could not be loaded right now.",
      source: "Published on X"
    },
    es: {
      title: "Escritura | Luis Andrés Cisneros",
      description: "Publicaciones recientes de Luis Andrés Cisneros sobre mercados, inversión, economía y construir con intención.",
      skip: "Ir al contenido",
      portfolio: "Portafolio",
      followNav: "Seguir en X ↗",
      archive: "Archivo de escritura",
      updated: "Actualizado semanalmente mediante la API de X",
      hero: "Ideas en <em>proceso.</em>",
      heroCopy: "Notas sobre mercados, inversión, economía y las decisiones detrás de construir una vida alrededor de la asignación de capital.",
      latestKicker: "Publicaciones recientes",
      latestTitle: "Últimas notas.",
      count: "Las seis publicaciones más recientes",
      continueKicker: "Continúa la conversación",
      continueTitle: "Sigue las ideas en tiempo real.",
      continueCopy: "Las nuevas notas se publican primero en X. Sígueme allí para ver cada publicación, observación de mercado e idea que todavía está tomando forma.",
      followAction: "Seguir a @cisnerosandress <span aria-hidden=\"true\">↗</span>",
      allAction: "Ver todas las publicaciones <span aria-hidden=\"true\">↗</span>",
      back: "← Volver al portafolio",
      empty: "Las publicaciones más recientes aparecerán aquí después de la próxima sincronización con X.",
      error: "Las publicaciones no se pudieron cargar en este momento.",
      source: "Publicado en X"
    }
  };

  const switcher = document.querySelector(".blog-language-switch");
  let posts = [];
  let failed = false;

  const currentLanguage = () => document.documentElement.lang === "es" ? "es" : "en";
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  const setHtml = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = value;
  };

  function formatDate(value, lang) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function splitPost(value) {
    const text = String(value || "")
      .replace(/\s+https:\/\/t\.co\/\S+$/i, "")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length <= 130) return { title: text, excerpt: "" };

    const candidates = [". ", "? ", "! ", ": ", "— "];
    let cut = -1;
    for (const marker of candidates) {
      const index = text.indexOf(marker, 48);
      if (index >= 0 && index <= 150 && (cut < 0 || index < cut)) cut = index + marker.trim().length;
    }

    if (cut < 0) {
      cut = text.lastIndexOf(" ", 118);
      if (cut < 55) cut = 118;
    }

    return {
      title: text.slice(0, cut).trim(),
      excerpt: text.slice(cut).trim()
    };
  }

  function createCard(post, index, lang) {
    const t = translations[lang];
    const parts = splitPost(post.text);
    const article = document.createElement("article");
    article.className = "blog-post-card";

    const link = document.createElement("a");
    link.href = post.url || `https://x.com/cisnerosandress/status/${post.id}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-label", `${parts.title} — ${t.source}`);

    const top = document.createElement("div");
    top.className = "blog-post-top";

    const date = document.createElement("time");
    date.dateTime = post.createdAt || "";
    date.textContent = formatDate(post.createdAt, lang);

    const number = document.createElement("span");
    number.className = "blog-post-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("h3");
    title.className = "blog-post-title";
    title.textContent = parts.title;

    const excerpt = document.createElement("p");
    excerpt.className = "blog-post-excerpt";
    excerpt.textContent = parts.excerpt || t.source;

    const bottom = document.createElement("div");
    bottom.className = "blog-post-bottom";
    const author = document.createElement("span");
    author.textContent = `@${post.username || "cisnerosandress"}`;
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";

    top.append(date, number);
    bottom.append(author, arrow);
    link.append(top, title, excerpt, bottom);
    article.append(link);
    return article;
  }

  function renderPosts() {
    const lang = currentLanguage();
    const t = translations[lang];
    grid.replaceChildren();

    if (failed || !posts.length) {
      const status = document.createElement("p");
      status.className = "blog-posts-status";
      status.textContent = failed ? t.error : t.empty;
      grid.append(status);
      return;
    }

    posts.slice(0, 6).forEach((post, index) => grid.append(createCard(post, index, lang)));
  }

  function applyLanguage(lang) {
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.description);
    setText(".blog-skip-link", t.skip);
    setText(".blog-portfolio-link", t.portfolio);
    setText(".blog-follow-nav", t.followNav);
    setText(".blog-archive-label", t.archive);
    setText(".blog-update-label", t.updated);
    setHtml(".blog-hero h1", t.hero);
    setText(".blog-hero-bottom p", t.heroCopy);
    setText(".blog-feed-header .blog-section-kicker", t.latestKicker);
    setText(".blog-feed-header h2", t.latestTitle);
    setText(".blog-feed-count", t.count);
    setText(".blog-follow-section .blog-section-kicker", t.continueKicker);
    setText(".blog-follow-section h2", t.continueTitle);
    setText(".blog-follow-copy > p", t.continueCopy);
    setHtml(".blog-primary-action", t.followAction);
    setHtml(".blog-secondary-action", t.allAction);
    setText(".blog-back-link", t.back);
    switcher.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    localStorage.setItem("portfolio-language", lang);
    renderPosts();
  }

  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (button) applyLanguage(button.dataset.lang);
  });

  fetch("data/x-posts.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      posts = Array.isArray(payload.posts)
        ? payload.posts.filter((post) =>
            post.isReply !== true &&
            !(post.referencedTweets || []).some((reference) => reference.type === "replied_to")
          )
        : [];
      renderPosts();
    })
    .catch(() => {
      failed = true;
      renderPosts();
    });

  const savedLanguage = localStorage.getItem("portfolio-language");
  const initialLanguage = savedLanguage || (navigator.language.toLowerCase().startsWith("es") ? "es" : "en");
  applyLanguage(initialLanguage);
})();
