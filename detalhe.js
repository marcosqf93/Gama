async function initDetail() {
  const API_URL = "https://geraldo-gama-admin.onrender.com/api/properties?limit=500";
  const box = document.getElementById("detalhe");

  if (box) {
    box.innerHTML = `
      <section class="detail-wrap">
        <h1>Carregando imóvel...</h1>
        <p>Buscando os dados do anúncio.</p>
      </section>
    `;
  }

  function formatMoney(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  }

  function normalizeProperty(item, extra = {}) {
    const photos = extra.fotos || (Array.isArray(item.imagens) && item.imagens.length ? item.imagens : item.imagem ? [item.imagem] : []);
    return {
      _id: item._id || "",
      referencia: String(item.referencia || ""),
      tipo: item.tipo || "",
      finalidade: item.finalidade || "",
      cidade: extra.cidade || item.cidade || "",
      endereco: extra.endereco || item.endereco || item.bairro || "",
      fotos: photos,
      imagem: photos[0] || "",
      dormitorios: Number(item.dormitorios || 0),
      vagas: Number(item.vagas ?? item.garagens ?? 0),
      area: extra.area || item.area || (item.metragem ? `${item.metragem} m²` : ""),
      venda: item.venda || formatMoney(item.valorVenda),
      locacao: item.locacao || formatMoney(item.valorLocacao),
      destaque: Boolean(extra.destaque ?? item.destaque),
      tourVirtual: Boolean(extra.tourVirtual ?? item.tourVirtual),
      descricao: item.descricao || "",
      ativo: item.ativo !== false,
    };
  }

  function refKey(value) {
    const raw = String(value ?? "").trim();
    const numeric = raw.replace(/^0+(\d)$/, "$1");
    return { raw, numeric };
  }

  async function loadProperties() {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get("ref") || params.get("id") || "";
      const response = await fetch(`${API_URL}&ref=${encodeURIComponent(refParam)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("API indisponível");
      const payload = await response.json();
      const live = Array.isArray(payload.properties)
        ? payload.properties.map((item) => {
            const extra = typeof IMOVEIS_ENRICHMENT !== "undefined" ? IMOVEIS_ENRICHMENT[String(item.referencia)] : null;
            return normalizeProperty(item, extra || {});
          })
        : [];
      if (live.length) return live.filter((item) => item.ativo !== false);
    } catch (err) {
      // usa fallback local
    }
    return IMOVEIS.map((item) => {
      const extra = (typeof IMOVEIS_ENRICHMENT !== "undefined" && IMOVEIS_ENRICHMENT[item.referencia]) || {};
      return normalizeProperty({ ...item, imagens: [item.imagem] }, extra);
    }).filter((item) => item.ativo !== false);
  }

  const params = new URLSearchParams(window.location.search);
  const refParam = params.get("ref") || params.get("id") || "";
  const propriedades = await loadProperties();
  const target = refKey(refParam);
  const imovelRaw = propriedades.find((item) => {
    const ref = refKey(item.referencia);
    return ref.raw === target.raw || ref.numeric === target.numeric || item._id === refParam || (!refParam && item.referencia);
  });
  const imovel = imovelRaw ? imovelRaw : null;
  if (!box) return;

  if (!imovel) {
    box.innerHTML = `
      <section class="detail-wrap">
        <h1>Imóvel não encontrado</h1>
        <p>O anúncio solicitado não existe ou foi removido.</p>
        <a class="btn btn-primary" href="/#imoveis">Voltar para listagem</a>
      </section>
    `;
    return;
  }

  try {
  const fotos = Array.isArray(imovel.fotos) && imovel.fotos.length ? imovel.fotos : [imovel.imagem];

  const seoTitle = `${imovel.endereco} - ${imovel.tipo} em ${imovel.cidade} | Imobiliária Geraldo Gama`;
  const seoDesc = `${imovel.tipo} ${imovel.finalidade === "venda" ? "à venda" : imovel.finalidade === "aluguel" ? "para locação" : "para venda e locação"} em ${imovel.cidade}. ${imovel.dormitorios} dormitório(s), ${imovel.vagas} vaga(s), ${imovel.area}. Fale com a Imobiliária Geraldo Gama.`;
  document.title = seoTitle;
  const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  const slugUrl = `https://imobiliariageraldogama.netlify.app/detalhe.html?id=${imovel.referencia}`;
  setMeta('meta[name="description"]', "content", seoDesc);
  setMeta('meta[property="og:title"]', "content", seoTitle);
  setMeta('meta[property="og:description"]', "content", seoDesc);
  setMeta('meta[property="og:image"]', "content", fotos[0]);
  setMeta('meta[property="og:image:width"]', "content", "1200");
  setMeta('meta[property="og:image:height"]', "content", "630");
  setMeta('meta[property="og:image:type"]', "content", "image/jpeg");
  setMeta('meta[property="og:url"]', "content", slugUrl);
  setMeta('link[rel="canonical"]', "href", slugUrl);

  const schemaTypeMap = {
    "Casa": "House", "Sobrado": "House", "Kitnet": "Apartment",
    "Apartamento": "Apartment", "Loja": "Product", "Terreno": "LandPlot",
    "Chácara": "SingleFamilyResidence", "Fazenda": "SingleFamilyResidence",
    "Prédio": "Product", "Flat": "Apartment", "Cobertura": "Apartment",
    "Sala": "Product"
  };
  const schemaType = schemaTypeMap[imovel.tipo] || "Product";
  const preco = imovel.venda !== "R$ 0,00" && imovel.venda !== "Consultar" ? imovel.venda
    : imovel.locacao !== "R$ 0,00" && imovel.locacao !== "Consultar" ? imovel.locacao
    : null;

  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  const ldData = {
    "@context": "https://schema.org",
    "@type": ["Product", schemaType],
    "name": `${imovel.tipo} - ${imovel.endereco}`,
    "description": seoDesc,
    "image": fotos,
    "url": window.location.href,
    "category": imovel.tipo,
    "additionalProperty": [
      {"@type": "PropertyValue", "name": "Dormitórios", "value": imovel.dormitorios},
      {"@type": "PropertyValue", "name": "Vagas", "value": imovel.vagas},
      {"@type": "PropertyValue", "name": "Área", "value": imovel.area}
    ]
  };
  if (preco) {
    ldData.offers = {
      "@type": "Offer",
      "price": preco.replace(/[R$\s.]/g, "").replace(",", "."),
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "seller": {"@type": "RealEstateAgent", "name": "Imobiliária Geraldo Gama"}
    };
  }
  ld.textContent = JSON.stringify(ldData);
  document.head.appendChild(ld);
  const acao =
    imovel.finalidade === "ambos"
      ? "Venda e locação"
      : imovel.finalidade === "venda"
      ? "Venda"
      : "Locação";

  const hasTour = imovel.tourVirtual || fotos.length >= 4;

  box.innerHTML = `
    <article class="detail-wrap reveal show">
      <div class="detail-badge-destaque">Em destaque</div>
      ${hasTour ? '<div class="detail-badge-tour">Tour virtual disponível</div>' : ''}
      <div class="gallery-premium">
        <div class="gallery-main" id="gallery-main">
          <img src="${fotos[0]}" alt="Imagem 1 do imóvel ${imovel.referencia}" class="gallery-main-img" id="gallery-main-img" loading="eager" />
          <button type="button" class="gallery-open-btn" id="gallery-open-btn" aria-label="Abrir foto em tela cheia">Ampliar</button>
          <div class="gallery-counter"><span id="gallery-idx">1</span> / ${fotos.length} fotos</div>
          ${fotos.length > 1 ? '<button class="slide-btn prev" id="prev-photo" aria-label="Foto anterior">\u2039</button><button class="slide-btn next" id="next-photo" aria-label="Próxima foto">\u203A</button>' : ''}
        </div>
        <div class="gallery-thumbs" id="gallery-thumbs">
          ${fotos.map((f, i) => `<button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Foto ${i + 1}"><img src="${f}" alt="Miniatura ${i + 1}" loading="lazy" /></button>`).join('')}
        </div>
      </div>
      <div class="detail-content">
        <p class="eyebrow">Referência ${imovel.referencia} - ${imovel.tipo}</p>
        <h1>${imovel.endereco}</h1>
        <p class="detail-city">${imovel.cidade}</p>

        <div class="detail-grid">
          <div><span>Finalidade</span><strong>${acao}</strong></div>
          <div><span>Dormitórios</span><strong>${imovel.dormitorios}</strong></div>
          <div><span>Vagas</span><strong>${imovel.vagas}</strong></div>
          <div><span>Área</span><strong>${imovel.area}</strong></div>
          <div><span>Venda</span><strong>${imovel.venda}</strong></div>
          <div><span>Locação</span><strong>${imovel.locacao}</strong></div>
        </div>

        <p class="descricao-imovel">
          ${imovel.tipo} localizado em ${imovel.cidade}, na região ${imovel.endereco}. Imóvel com ${imovel.dormitorios}
          dormitório(s), ${imovel.vagas} vaga(s) e área informada de ${imovel.area}. Disponibilidade para ${acao.toLowerCase()}.
          Para condições comerciais atualizadas e visita presencial, fale direto com a equipe da Imobiliária Geraldo Gama.
        </p>

        <div class="detail-actions">
          <a class="btn btn-primary" href="https://wa.me/5567998126525?text=Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${imovel.referencia}" target="_blank" rel="noopener">Falar no WhatsApp</a>
          <a class="btn btn-secondary" href="/#imoveis">Voltar aos imóveis</a>
        </div>

        <div class="share-row">
          <button class="icon-btn" id="share-native" type="button" aria-label="Compartilhar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg></button>
          <a class="icon-btn" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp" href="https://wa.me/?text=${encodeURIComponent(window.location.href)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-7.6-11.5A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8.5v.5z"/></svg></a>
          <a class="icon-btn" target="_blank" rel="noopener" aria-label="Compartilhar no Facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg></a>
          <a class="icon-btn" target="_blank" rel="noopener" aria-label="Compartilhar no Instagram" href="https://www.instagram.com/imobiliariageraldo/"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>
        </div>
      </div>
    </article>

    <div class="gallery-modal" id="gallery-modal" aria-hidden="true">
      <button type="button" class="gallery-modal-close" id="gallery-modal-close" aria-label="Fechar">×</button>
      <button type="button" class="gallery-modal-nav prev" id="gallery-modal-prev" aria-label="Foto anterior">‹</button>
      <figure class="gallery-modal-figure">
        <img id="gallery-modal-img" src="${fotos[0]}" alt="Foto ampliada 1 do imóvel ${imovel.referencia}" />
        <figcaption id="gallery-modal-caption">Foto 1 de ${fotos.length}</figcaption>
      </figure>
      <button type="button" class="gallery-modal-nav next" id="gallery-modal-next" aria-label="Próxima foto">›</button>
    </div>
  `;

  let photoIndex = 0;
  let modalOpen = false;
  let zoomed = false;
  const mainImg = document.getElementById("gallery-main-img");
  const counterEl = document.getElementById("gallery-idx");
  const thumbs = document.querySelectorAll(".gallery-thumb");
  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("gallery-modal-img");
  const modalCaption = document.getElementById("gallery-modal-caption");
  const openBtn = document.getElementById("gallery-open-btn");
  const closeBtn = document.getElementById("gallery-modal-close");
  const modalPrev = document.getElementById("gallery-modal-prev");
  const modalNext = document.getElementById("gallery-modal-next");
  const prevBtn = document.getElementById("prev-photo");
  const nextBtn = document.getElementById("next-photo");

  function renderActive(idx) {
    photoIndex = idx;
    mainImg.src = fotos[idx];
    counterEl.textContent = idx + 1;
    thumbs.forEach((t, i) => t.classList.toggle("active", i === idx));
    const activeThumb = thumbs[idx];
    if (activeThumb) activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    if (modalOpen) {
      modalImg.src = fotos[idx];
      modalCaption.textContent = `Foto ${idx + 1} de ${fotos.length}`;
      modalImg.classList.toggle("zoomed", zoomed);
    }
  }

  function openModal(idx) {
    modalOpen = true;
    zoomed = false;
    renderActive(idx);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    modalOpen = false;
    zoomed = false;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function step(delta) {
    renderActive((photoIndex + delta + fotos.length) % fotos.length);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => step(1));
  thumbs.forEach((t) => t.addEventListener("click", () => renderActive(parseInt(t.dataset.index, 10))));
  if (openBtn) openBtn.addEventListener("click", () => openModal(photoIndex));
  mainImg.addEventListener("click", () => openModal(photoIndex));
  if (modalPrev) modalPrev.addEventListener("click", () => step(-1));
  if (modalNext) modalNext.addEventListener("click", () => step(1));
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modalImg.addEventListener("click", () => { zoomed = !zoomed; modalImg.classList.toggle("zoomed", zoomed); });

  let touchStartX = 0;
  modal.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  modal.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) step(-1); else step(1);
    }
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (!modalOpen) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  const shareNative = document.getElementById("share-native");
  if (shareNative) {
    shareNative.addEventListener("click", async () => {
      if (navigator.share) {
        await navigator.share({ title: `Imóvel ${imovel.referencia} - Imobiliária Geraldo Gama`, url: window.location.href });
      } else {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener");
      }
    });
  }

  const waFloat = document.getElementById("whatsapp-detalhe");
  if (waFloat) {
    waFloat.href = `https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${imovel.referencia}%20-%20${encodeURIComponent(imovel.endereco)}.%20Quero%20agendar%20uma%20visita.`;
  }
  } catch (err) {
    box.innerHTML = `
      <section class="detail-wrap">
        <h1>Erro ao carregar o imóvel</h1>
        <p>${String(err.message || err)}</p>
        <a class="btn btn-primary" href="/#imoveis">Voltar para listagem</a>
      </section>
    `;
    console.error(err);
  }
}

initDetail();
