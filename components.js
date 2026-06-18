function renderLayout() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  if (header) {
    header.innerHTML = `
      <header class="topbar">
        <div class="container topbar-wrap">
          <a href="index.html" class="brand-link">
            <img class="brand" src="https://res.cloudinary.com/dqq4qonkb/image/upload/v1779394470/images_ikvtoi.jpg" alt="Imobiliária Geraldo Gama" />
          </a>

          <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>

          <nav class="main-nav" id="main-nav">
            <a href="index.html#home">Início</a>
            <a href="index.html#sobre">Quem Somos</a>
            <a class="nav-highlight" href="index.html#cta-anunciar">Anunciar</a>
            <a href="index.html#imoveis">Imóveis</a>
            <a href="index.html#contato">Contato</a>
          </nav>

          <div class="social-mini">
            <a class="icon-btn" href="https://www.instagram.com/imobiliariageraldo/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>
            <a class="icon-btn" href="https://www.facebook.com/imoveisaquidauana" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg></a>
            <a class="icon-btn" href="https://wa.me/5567998126525" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-7.6-11.5A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8.5v.5z"/></svg></a>
            <a class="icon-btn" href="mailto:geraldogamaimv@gmail.com" aria-label="E-mail"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg></a>
          </div>
        </div>
      </header>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <div class="container footer-grid">
          <section>
            <img class="brand footer-brand" src="https://res.cloudinary.com/dqq4qonkb/image/upload/v1779394470/images_ikvtoi.jpg" alt="Imobiliária Geraldo Gama" />
            <p>Rua Roberto Scaff, 960 - Bairro Alto, Aquidauana-MS</p>
            <p>Telefone: (67) 9.9812-6525 | WhatsApp: (67) 99812-6525</p>
            <p>E-mail: geraldogamaimv@gmail.com</p>
            <p><strong>Horário:</strong> seg a sex 07:00-11:00 / 13:00-17:00 | sáb 07:00-11:00 | dom fechado</p>
            <p><strong>CRECI:</strong> 4511-MS | <strong>10 anos</strong> de mercado</p>
          </section>

          <section>
            <h3>Redes sociais</h3>
            <div class="social-row">
              <a class="icon-btn" href="https://www.instagram.com/imobiliariageraldo/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>
              <a class="icon-btn" href="https://www.facebook.com/imoveisaquidauana" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg></a>
              <a class="icon-btn" href="https://wa.me/5567998126525" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-7.6-11.5A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8.5v.5z"/></svg></a>
              <a class="icon-btn" href="mailto:geraldogamaimv@gmail.com" aria-label="E-mail"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg></a>
            </div>
          </section>

          <section>
            <h3>Como chegar</h3>
            <iframe
              class="map-frame"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Rua+Roberto+Scaff,+960,+Aquidauana+-+MS&output=embed"
              title="Mapa da Imobiliária"
            ></iframe>
          </section>

          <section>
            <h3>Atuamos em</h3>
            <ul class="city-list">
              <li>Aquidauana</li>
              <li>Anastácio</li>
              <li>Miranda</li>
              <li>Dois Irmãos do Buriti</li>
            </ul>
          </section>
        </div>
        <div class="footer-signature">
          Site BETA desenvolvido por <strong>MARCOS</strong>
        </div>
      </footer>
    `;
  }

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
}

renderLayout();

// scroll to top
(function () {
  const btn = document.createElement("button");
  btn.className = "scroll-top";
  btn.setAttribute("aria-label", "Voltar ao topo");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 300);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// reviews slider dots + auto-play
(function () {
  let autoTimer;
  let scrollHandler, mouseEnter, mouseLeave, touchStart, touchEnd;
  const track = document.getElementById("reviews-track");
  const dotsContainer = document.getElementById("review-dots");
  if (!track || !dotsContainer) return;

  function initSlider() {
    cleanup();
    const cards = track.querySelectorAll(".review-card");
    if (!cards.length) return;

    dotsContainer.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "review-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Avaliação " + (i + 1));
      dot.addEventListener("click", () => {
        const cardRect = cards[i].getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        track.scrollTo({ left: track.scrollLeft + cardRect.left - trackRect.left, behavior: "smooth" });
        resetAuto();
      });
      dotsContainer.appendChild(dot);
    });

    function updateDots() {
      const currentCards = track.querySelectorAll(".review-card");
      if (!currentCards.length) return;
      const step = currentCards[0].offsetWidth + 16;
      const idx = step ? Math.round(track.scrollLeft / step) : 0;
      dotsContainer.querySelectorAll(".review-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
    }

    function goNext() {
      const currentCards = track.querySelectorAll(".review-card");
      if (!currentCards.length) return;
      const step = currentCards[0].offsetWidth + 16;
      const max = track.scrollWidth - track.clientWidth;
      let next = track.scrollLeft + step;
      if (next >= max) next = 0;
      track.scrollTo({ left: next, behavior: "smooth" });
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(goNext, 4000); }
    function stopAuto() { clearInterval(autoTimer); }
    function resetAuto() { startAuto(); }

    scrollHandler = updateDots;
    mouseEnter = stopAuto;
    mouseLeave = startAuto;
    touchStart = stopAuto;
    touchEnd = startAuto;

    track.addEventListener("scroll", scrollHandler);
    track.addEventListener("mouseenter", mouseEnter);
    track.addEventListener("mouseleave", mouseLeave);
    track.addEventListener("touchstart", touchStart, { passive: true });
    track.addEventListener("touchend", touchEnd, { passive: true });

    updateDots();
    startAuto();
  }

  function cleanup() {
    clearInterval(autoTimer);
    if (track) {
      track.removeEventListener("scroll", scrollHandler);
      track.removeEventListener("mouseenter", mouseEnter);
      track.removeEventListener("mouseleave", mouseLeave);
      track.removeEventListener("touchstart", touchStart);
      track.removeEventListener("touchend", touchEnd);
    }
  }

  window.addEventListener("reviews-replaced", initSlider);
  initSlider();
})();

// live reviews from proxy
(async function () {
  const track = document.getElementById("reviews-track");
  if (!track) return;
  try {
    const res = await fetch("/api/reviews");
    if (!res.ok) return;
    const data = await res.json();
    if (!data.reviews || !data.reviews.length) return;
    if (data.rating && data.source === "google") {
      const ratingBadge = document.querySelector(".reviews-rating-badge") || document.createElement("div");
      ratingBadge.className = "reviews-rating-badge";
      ratingBadge.textContent = `★ ${data.rating.toFixed(1)} · ${data.total} avaliações`;
      document.querySelector(".reviews-header div")?.appendChild(ratingBadge);
    }
    track.innerHTML = data.reviews
      .map(
        (r) =>
          `<article class="review-card"><div class="review-stars">${"★".repeat(Math.min(5, r.rating))}${"☆".repeat(5 - Math.min(5, r.rating))}</div><blockquote>${r.text}</blockquote><span class="review-author">— ${r.author}</span></article>`
      )
      .join("");
    document.querySelectorAll(".review-source").forEach(el => el.remove());
    // re-init slider with new cards
    const evt = new CustomEvent("reviews-replaced");
    window.dispatchEvent(evt);
  } catch {
    // proxy not available — static reviews remain
  }
})();
