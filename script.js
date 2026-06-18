const API_URL = "https://geraldo-gama-admin.onrender.com/api/properties?limit=500";

function formatMoney(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function parseCurrency(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").trim();
  return parseFloat(cleaned) || 0;
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
    descricao: item.descricao || "",
    ativo: item.ativo !== false,
  };
}

const fallbackImoveis = IMOVEIS.map((item) => {
  const extra = (typeof IMOVEIS_ENRICHMENT !== "undefined" && IMOVEIS_ENRICHMENT[item.referencia]) || {};
  return normalizeProperty({
    ...item,
    imagens: [item.imagem],
    imagensFallback: [item.imagem],
  }, extra);
});

let imoveis = fallbackImoveis;

const q = document.getElementById("hero-q");
const tipo = document.getElementById("hero-tipo");
const cidade = document.getElementById("hero-cidade");
const valor = document.getElementById("hero-valor");
const cards = document.getElementById("cards");
const stats = document.getElementById("stats");
const loadMore = document.getElementById("load-more");
let visibleCount = 12;
let filtroFinalidade = "";

function filterByValor(prop, range) {
  if (!range) return true;
  const [min, max] = range.split("-").map(Number);
  const val = parseCurrency(prop.venda) || parseCurrency(prop.locacao);
  if (range.endsWith("+")) return val >= min;
  return val >= min && val <= max;
}

function fillSelect(id, values) {
  values.forEach((item) => {
    const o = document.createElement("option");
    o.value = item;
    o.textContent = item;
    id.appendChild(o);
  });
}

function populateSelects() {
  tipo.innerHTML = '<option value="">Tipo: Todos</option>';
  cidade.innerHTML = '<option value="">Cidade: Todas</option>';
  fillSelect(tipo, [...new Set(imoveis.map((i) => i.tipo).filter(Boolean))].sort());
  fillSelect(cidade, [...new Set(imoveis.map((i) => i.cidade).filter(Boolean))].sort());
}

function setImoveis(data) {
  imoveis = (Array.isArray(data) ? data : []).filter((item) => item && item.ativo !== false);
  populateSelects();
  visibleCount = 12;
  render();
  renderDestaques();
}

async function carregarImoveis() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("API indisponível");
    const payload = await response.json();
    const live = Array.isArray(payload.properties) ? payload.properties.map((item) => normalizeProperty(item)) : [];
    if (live.length) {
      setImoveis(live);
      return;
    }
  } catch (err) {
    // mantém fallback local
  }
  setImoveis(fallbackImoveis);
}

function render() {
  const term = q.value.toLowerCase().trim();
  const filtrados = imoveis.filter((i) => {
    const hitTerm = !term || `${i.referencia} ${i.endereco} ${i.tipo}`.toLowerCase().includes(term);
    const hitTipo = !tipo.value || i.tipo === tipo.value;
    const hitFinalidade = !filtroFinalidade || i.finalidade === filtroFinalidade;
    const hitCidade = !cidade.value || i.cidade === cidade.value;
    const hitValor = filterByValor(i, valor.value);
    return hitTerm && hitTipo && hitFinalidade && hitCidade && hitValor;
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
          <p class="price-line">${i.venda !== "R$ 0,00" && i.venda !== "Consultar" ? `Venda: ${i.venda}` : ""}${i.venda !== "R$ 0,00" && i.venda !== "Consultar" && i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? " | " : ""}${i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? `Locação: ${i.locacao}` : ""}</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="/detalhe.html?id=${i.referencia}">Ver detalhes</a>
            <a class="btn btn-outline" href="https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${i.referencia}%20-%20${encodeURIComponent(i.endereco)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
    )
    .join("");

  if (loadMore) {
    loadMore.style.display = filtrados.length > visibleCount ? "inline-flex" : "none";
  }
}

[q, tipo, cidade, valor].forEach((el) => el.addEventListener("input", () => {
  visibleCount = 12;
  render();
}));

document.querySelectorAll(".hero-search-pills .pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filtroFinalidade = btn.dataset.fin === "todos" ? "" : btn.dataset.fin;
    visibleCount = 12;
    render();
  });
});

if (loadMore) {
  loadMore.addEventListener("click", () => {
    visibleCount += 12;
    render();
  });
}
populateSelects();
render();
carregarImoveis();

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("show")),
  { threshold: 0.2 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

window.addEventListener("scroll", () => {
  const y = window.scrollY * 0.18;
  document.querySelector(".hero").style.backgroundPosition = `center calc(50% + ${y}px)`;
});

function renderDestaques() {
  const container = document.getElementById("destaque-cards");
  if (!container) return;
  const destaques = imoveis.filter((i) => i.destaque).slice(0, 6);
  container.innerHTML = destaques
    .map(
      (i) => `
      <article class="card card-destaque reveal show">
        <div class="thumb-wrap"><img src="${i.imagem}" alt="Imovel ${i.referencia}" loading="lazy"/></div>
        <div class="card-badge">Destaque</div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${i.referencia}</span><span class="tag">${i.tipo}</span><span class="tag">${i.finalidade}</span></div>
          <h3>${i.endereco}</h3>
          <p>${i.cidade}</p>
          <p>Dormitórios: ${i.dormitorios} | Vagas: ${i.vagas} | Área: ${i.area}</p>
          <p class="price-line">${i.venda !== "R$ 0,00" && i.venda !== "Consultar" ? `Venda: ${i.venda}` : ""}${i.venda !== "R$ 0,00" && i.venda !== "Consultar" && i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? " | " : ""}${i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? `Locação: ${i.locacao}` : ""}</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="/detalhe.html?id=${i.referencia}">Ver detalhes</a>
            <a class="btn btn-outline" href="https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${i.referencia}%20-%20${encodeURIComponent(i.endereco)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
    )
    .join("");
}

renderDestaques();
