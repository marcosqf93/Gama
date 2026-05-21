const imoveis = IMOVEIS.map((item) => {
  const extra = (typeof IMOVEIS_ENRICHMENT !== "undefined" && IMOVEIS_ENRICHMENT[item.referencia]) || {};
  return {
    ...item,
    cidade: extra.cidade || item.cidade,
    endereco: extra.endereco || item.endereco,
    fotos: extra.fotos || [item.imagem]
  };
});

const q = document.getElementById("q");
const tipo = document.getElementById("tipo");
const finalidade = document.getElementById("finalidade");
const cidade = document.getElementById("cidade");
const cards = document.getElementById("cards");
const stats = document.getElementById("stats");
const loadMore = document.getElementById("load-more");
let visibleCount = 12;

function fillSelect(id, values) {
  values.forEach((item) => {
    const o = document.createElement("option");
    o.value = item;
    o.textContent = item;
    id.appendChild(o);
  });
}

fillSelect(tipo, [...new Set(imoveis.map((i) => i.tipo))].sort());
fillSelect(cidade, [...new Set(imoveis.map((i) => i.cidade))].sort());

function render() {
  const term = q.value.toLowerCase().trim();
  const filtrados = imoveis.filter((i) => {
    const hitTerm = !term || `${i.referencia} ${i.endereco} ${i.tipo}`.toLowerCase().includes(term);
    const hitTipo = !tipo.value || i.tipo === tipo.value;
    const hitFinalidade = !finalidade.value || i.finalidade === finalidade.value;
    const hitCidade = !cidade.value || i.cidade === cidade.value;
    return hitTerm && hitTipo && hitFinalidade && hitCidade;
  });

  stats.textContent = `${filtrados.length} imóveis encontrados de ${imoveis.length} cadastrados.`;
  const exibidos = filtrados.slice(0, visibleCount);
  cards.innerHTML = exibidos
    .map(
      (i) => `
      <article class="card reveal show">
        <div class="thumb-wrap"><img src="${i.imagem}" alt="Imovel ${i.referencia}" loading="lazy"/></div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${i.referencia}</span><span class="tag">${i.tipo}</span><span class="tag">${i.finalidade}</span></div>
          <h3>${i.endereco}</h3>
          <p>${i.cidade}</p>
          <p>Dormitórios: ${i.dormitorios} | Vagas: ${i.vagas} | Área: ${i.area}</p>
          <p>Venda: ${i.venda} | Locação: ${i.locacao}</p>
          <a class="btn btn-primary" href="detalhe.html?ref=${i.referencia}">Ver detalhes</a>
        </div>
      </article>`
    )
    .join("");

  if (loadMore) {
    loadMore.style.display = filtrados.length > visibleCount ? "inline-flex" : "none";
  }
}

[q, tipo, finalidade, cidade].forEach((el) => el.addEventListener("input", () => {
  visibleCount = 12;
  render();
}));
if (loadMore) {
  loadMore.addEventListener("click", () => {
    visibleCount += 12;
    render();
  });
}
render();

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("show")),
  { threshold: 0.2 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

window.addEventListener("scroll", () => {
  const y = window.scrollY * 0.18;
  document.querySelector(".hero").style.backgroundPosition = `center calc(50% + ${y}px)`;
});
