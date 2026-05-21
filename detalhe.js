const params = new URLSearchParams(window.location.search);
const ref = params.get("ref");
const imovelRaw = IMOVEIS.find((item) => item.referencia === ref);
const extra = imovelRaw && typeof IMOVEIS_ENRICHMENT !== "undefined" ? IMOVEIS_ENRICHMENT[imovelRaw.referencia] : null;
const imovel = imovelRaw
  ? {
      ...imovelRaw,
      cidade: (extra && extra.cidade) || imovelRaw.cidade,
      endereco: (extra && extra.endereco) || imovelRaw.endereco,
      fotos: (extra && extra.fotos) || [imovelRaw.imagem]
    }
  : null;
const box = document.getElementById("detalhe");

if (!imovel) {
  box.innerHTML = `
    <section class="detail-wrap">
      <h1>Imóvel não encontrado</h1>
      <p>O anúncio solicitado não existe ou foi removido.</p>
      <a class="btn btn-primary" href="index.html">Voltar para listagem</a>
    </section>
  `;
} else {
  const fotos = Array.isArray(imovel.fotos) && imovel.fotos.length ? imovel.fotos : [imovel.imagem];
  const acao =
    imovel.finalidade === "ambos"
      ? "Venda e locação"
      : imovel.finalidade === "venda"
      ? "Venda"
      : "Locação";

  box.innerHTML = `
    <article class="detail-wrap reveal show">
      <div class="detail-media" id="detail-media" data-index="0">
        <img src="${fotos[0]}" alt="Imagem do imóvel ${imovel.referencia}" id="detail-image" />
        <button class="slide-btn prev ${fotos.length < 2 ? "hidden" : ""}" id="prev-photo" aria-label="Foto anterior">‹</button>
        <button class="slide-btn next ${fotos.length < 2 ? "hidden" : ""}" id="next-photo" aria-label="Próxima foto">›</button>
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
          <a class="btn btn-secondary" href="index.html#imoveis">Voltar aos imóveis</a>
        </div>

        <div class="share-row">
          <button class="icon-btn" id="share-native" type="button" aria-label="Compartilhar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg></button>
          <a class="icon-btn" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp" href="https://wa.me/?text=${encodeURIComponent(window.location.href)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-7.6-11.5A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8.5v.5z"/></svg></a>
          <a class="icon-btn" target="_blank" rel="noopener" aria-label="Compartilhar no Facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg></a>
          <a class="icon-btn" target="_blank" rel="noopener" aria-label="Compartilhar no Instagram" href="https://www.instagram.com/imobiliariageraldo/"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>
        </div>
      </div>
    </article>
  `;

  let photoIndex = 0;
  const imageEl = document.getElementById("detail-image");
  const prevBtn = document.getElementById("prev-photo");
  const nextBtn = document.getElementById("next-photo");
  const updatePhoto = () => {
    imageEl.src = fotos[photoIndex];
  };
  if (prevBtn && nextBtn && fotos.length > 1) {
    prevBtn.addEventListener("click", () => {
      photoIndex = (photoIndex - 1 + fotos.length) % fotos.length;
      updatePhoto();
    });
    nextBtn.addEventListener("click", () => {
      photoIndex = (photoIndex + 1) % fotos.length;
      updatePhoto();
    });
  }

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
}
