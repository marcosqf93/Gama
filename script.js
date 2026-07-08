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
    bairro: extra.bairro || item.bairro || "",
    endereco: extra.endereco || item.endereco || item.bairro || "",
    fotos: photos,
    imagem: photos[0] || "",
    dormitorios: Number(item.dormitorios || 0),
    suites: Number(item.suites || 0),
    salas: Number(item.salas || 0),
    cozinhas: Number(item.cozinhas || 0),
    banheiros: Number(item.banheiros || 0),
    varandas: Number(item.varandas || 0),
    vagas: Number(item.vagas ?? item.garagens ?? 0),
    garagens: Number(item.garagens ?? item.vagas ?? 0),
    areaGourmet: Number(item.areaGourmet || 0),
    areaServico: Number(item.areaServico || 0),
    copa: Number(item.copa || 0),
    area: extra.area || item.area || (item.metragem ? `${item.metragem} m²` : ""),
    metragem: Math.round(Number(item.metragem || 0)),
    venda: item.venda || formatMoney(item.valorVenda),
    locacao: item.locacao || formatMoney(item.valorLocacao),
    destaque: Boolean(item.destaque ?? extra.destaque),
    descricao: item.descricao || "",
    ativo: item.ativo !== false,
  };
}

function refKey(value) {
  const raw = String(value ?? "").trim();
  const numeric = raw.replace(/^0+(\d)$/, "$1");
  return { raw, numeric };
}

function isCloudinaryUrl(url) {
  return typeof url === "string" && /res\.cloudinary\.com/.test(url) && /\/upload\//.test(url);
}

function cloudinaryVariant(url, width, height) {
  if (!isCloudinaryUrl(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`);
}

function responsiveImageAttrs(url, alt, options = {}) {
  const { width, height, sizes, loading = "lazy", fetchpriority } = options;
  const parts = [`src="${isCloudinaryUrl(url) ? cloudinaryVariant(url, width || 800, height || 600) : url}"`, `alt="${alt}"`];

  if (isCloudinaryUrl(url)) {
    const srcset = [400, 800, 1200]
      .map((w) => `${cloudinaryVariant(url, w, Math.round((height || 600) * (w / (width || 800))))} ${w}w`)
      .join(", ");
    parts.push(`srcset="${srcset}"`);
    if (sizes) parts.push(`sizes="${sizes}"`);
  }

  if (width) parts.push(`width="${width}"`);
  if (height) parts.push(`height="${height}"`);
  if (loading) parts.push(`loading="${loading}"`);
  if (fetchpriority) parts.push(`fetchpriority="${fetchpriority}"`);
  return parts.join(" ");
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
const mobileFilterTrigger = document.getElementById("mobile-filter-trigger");
const mobileFilterBackdrop = document.getElementById("mobile-filter-backdrop");
const mobileFilterSheet = document.getElementById("mobile-filter-sheet");
const mobileFilterClose = document.getElementById("mobile-filter-close");
const mobileFilterApply = document.getElementById("mobile-filter-apply");
const mobileFilterQ = document.getElementById("mobile-filter-q");
const mobileFilterFinalidade = document.getElementById("mobile-filter-finalidade");
const mobileFilterTipo = document.getElementById("mobile-filter-tipo");
const mobileFilterCidade = document.getElementById("mobile-filter-cidade");
const mobileFilterValor = document.getElementById("mobile-filter-valor");
const mobileFilterQuartos = document.getElementById("mobile-filter-quartos");
const mobileFilterBairro = document.getElementById("mobile-filter-bairro");
const cards = document.getElementById("cards");
const stats = document.getElementById("stats");
const loadMore = document.getElementById("load-more");
const trustCount = document.querySelector('[data-trust="count"] strong');
let visibleCount = window.matchMedia && window.matchMedia("(max-width: 900px)").matches ? 6 : 12;
let filtroFinalidade = "";
let categoriaFiltro = "";
let filtroQuartos = "";
let filtroBairro = "";

function updateTrustCount(total) {
  if (!trustCount) return;
  const n = Number(total) || 0;
  trustCount.textContent = n === 1 ? "1 imóvel" : `${n} imóveis`;
}

function pluralize(value, singular, plural) {
  const n = Number(value) || 0;
  if (!n) return "";
  return `${n} ${n === 1 ? singular : plural}`;
}

function propertyFeatureList(item) {
  const features = [];
  const push = (label) => { if (label) features.push(label); };
  push(pluralize(item.suites, "Suíte", "Suítes"));
  push(pluralize(item.dormitorios, "Dormitório", "Dormitórios"));
  push(pluralize(item.banheiros, "Banheiro", "Banheiros"));
  push(pluralize(item.salas, "Sala", "Salas"));
  push(pluralize(item.cozinhas, "Cozinha", "Cozinhas"));
  push(pluralize(item.varandas, "Varanda", "Varandas"));
  push(pluralize(item.garagens || item.vagas, "Garagem", "Garagens"));
  push(item.areaGourmet ? "Área gourmet" : "");
  push(item.areaServico ? "Área de serviço" : "");
  push(item.copa ? "Copa" : "");
  if (item.metragem) push(`${item.metragem} m²`);
  return features.filter(Boolean);
}

function featureIcon(type) {
  const icons = {
    suites: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18v8H3z"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/></svg>',
    dormitorios: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11h18v7H3z"/><path d="M5 11V8h6a3 3 0 0 1 3 3"/></svg>',
    banheiros: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7V5a2 2 0 0 1 2-2h4"/><path d="M5 10h14a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M8 14l-1 6h10l-1-6"/></svg>',
    salas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v8H4z"/><path d="M7 10V7h10v3"/></svg>',
    cozinhas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v9H4z"/><path d="M7 9V5h10v4"/><path d="M8 13h2M12 13h2M16 13h2"/></svg>',
    areaGourmet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V9l6-4 6 4v11"/><path d="M9 20v-5h6v5"/></svg>',
    areaServico: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M8 7V4h8v3"/><path d="M8 12h8"/></svg>',
    copa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V5z"/><path d="M19 8h2a2 2 0 0 1 0 4h-2"/></svg>',
    varandas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/><path d="M6 12V6h12v6"/><path d="M7 20h10"/></svg>',
    vagas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10"/><path d="M8 19v-4h8v4"/></svg>',
    metragem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V6"/><path d="M6 6h10"/><path d="M16 6v10"/></svg>',
  };
  return icons[type] || icons.dormitorios;
}

function propertyFeatureEntries(item) {
  return [
    { key: "suites", label: "Suíte", value: item.suites },
    { key: "dormitorios", label: "Dormitório", value: item.dormitorios },
    { key: "banheiros", label: "Banheiro", value: item.banheiros },
    { key: "salas", label: "Sala", value: item.salas },
    { key: "cozinhas", label: "Cozinha", value: item.cozinhas },
    { key: "areaGourmet", label: "Área gourmet", value: item.areaGourmet },
    { key: "areaServico", label: "Área de serviço", value: item.areaServico },
    { key: "copa", label: "Copa", value: item.copa },
  ].filter((entry) => Number(entry.value) > 0);
}

function renderFeatureIcons(item, limit = 4) {
  const entries = propertyFeatureEntries(item).slice(0, limit);
  if (!entries.length) return "";
  return `<div class="feature-icons">${entries.map((entry) => {
    const count = Number(entry.value) || 0;
    return `<span class="feature-icon" title="${count} ${entry.label}${count > 1 ? 's' : ''}" aria-label="${count} ${entry.label}${count > 1 ? 's' : ''}">${featureIcon(entry.key)}${count > 1 ? `<strong>${count}</strong>` : ""}</span>`;
  }).join("")}</div>`;
}

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
  if (mobileFilterTipo) {
    mobileFilterTipo.innerHTML = '<option value="">Todos</option>';
    fillSelect(mobileFilterTipo, [...new Set(imoveis.map((i) => i.tipo).filter(Boolean))].sort());
  }
  if (mobileFilterCidade) {
    mobileFilterCidade.innerHTML = '<option value="">Todas</option>';
    fillSelect(mobileFilterCidade, [...new Set(imoveis.map((i) => i.cidade).filter(Boolean))].sort());
  }
}

function setImoveis(data) {
  imoveis = (Array.isArray(data) ? data : []).filter((item) => item && item.ativo !== false);
  populateSelects();
  visibleCount = 12;
  updateTrustCount(imoveis.length);
  window.dispatchEvent(new CustomEvent("imoveis-ready", { detail: { total: imoveis.length } }));
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
    const hitCategoria = !categoriaFiltro || matchesCategory(i.tipo, categoriaFiltro);
    const hitFinalidade = !filtroFinalidade || matchesFinalidade(i.finalidade, filtroFinalidade);
    const hitCidade = !cidade.value || i.cidade === cidade.value;
    const hitValor = filterByValor(i, valor.value);
    const hitQuartos = !filtroQuartos || Number(i.dormitorios || 0) >= Number(filtroQuartos);
    const textBairro = `${i.bairro || ""} ${i.endereco || ""}`.toLowerCase();
    const hitBairro = !filtroBairro || textBairro.includes(filtroBairro.toLowerCase());
    return hitTerm && hitTipo && hitCategoria && hitFinalidade && hitCidade && hitValor && hitQuartos && hitBairro;
  });

  stats.textContent = `${filtrados.length} imóveis encontrados de ${imoveis.length} cadastrados.`;
  const exibidos = filtrados.slice(0, visibleCount);
  cards.innerHTML = exibidos
    .map(
      (i) => `
      <article class="card reveal show">
        <div class="thumb-wrap"><img ${responsiveImageAttrs(i.imagem, `Imovel ${i.referencia}`, { width: 800, height: 600, sizes: "(max-width: 768px) 100vw, 33vw", loading: "lazy" })} /></div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${i.referencia || i._id}</span><span class="tag">${i.tipo}</span><span class="tag">${i.finalidade}</span></div>
          <h3>${i.endereco}</h3>
          <p>${i.cidade}</p>
          ${renderFeatureIcons(i, 4)}
          <p class="price-line">${i.venda !== "R$ 0,00" && i.venda !== "Consultar" ? `Venda: ${i.venda}` : ""}${i.venda !== "R$ 0,00" && i.venda !== "Consultar" && i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? " | " : ""}${i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? `Locação: ${i.locacao}` : ""}</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="/detalhe.html?id=${encodeURIComponent(refKey(i.referencia || i._id).raw)}">Ver detalhes</a>
            <a class="btn btn-outline" href="https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${encodeURIComponent(refKey(i.referencia || i._id).raw)}%20-%20${encodeURIComponent(i.endereco)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
    )
    .join("");

  if (loadMore) {
    loadMore.style.display = filtrados.length > visibleCount ? "inline-flex" : "none";
  }
}

function matchesFinalidade(value, selected) {
  if (!selected) return true;
  if (selected === "venda") return value === "venda" || value === "ambos";
  if (selected === "aluguel") return value === "aluguel" || value === "ambos";
  return value === selected;
}

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesCategory(type, category) {
  if (!category) return true;
  const t = normalizeText(type);
  const c = normalizeText(category);
  if (c === "comercial") return t.includes("comercial") || t.includes("loja") || t.includes("sala");
  if (c === "chacara") return t.includes("chacara") || t.includes("sitio");
  return t === c || t.includes(c);
}

function syncMobileSheet() {
  if (mobileFilterQ) mobileFilterQ.value = q.value;
  if (mobileFilterTipo) mobileFilterTipo.value = tipo.value;
  if (mobileFilterCidade) mobileFilterCidade.value = cidade.value;
  if (mobileFilterValor) mobileFilterValor.value = valor.value;
  if (mobileFilterQuartos) mobileFilterQuartos.value = filtroQuartos;
  if (mobileFilterBairro) mobileFilterBairro.value = filtroBairro;
  if (mobileFilterFinalidade) mobileFilterFinalidade.value = filtroFinalidade || "";
}

function openMobileFilters() {
  syncMobileSheet();
  mobileFilterSheet?.classList.add("open");
  mobileFilterBackdrop?.classList.add("open");
  mobileFilterSheet?.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeMobileFilters() {
  mobileFilterSheet?.classList.remove("open");
  mobileFilterBackdrop?.classList.remove("open");
  mobileFilterSheet?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function applyMobileFilters() {
  q.value = mobileFilterQ?.value || "";
  tipo.value = mobileFilterTipo?.value || "";
  cidade.value = mobileFilterCidade?.value || "";
  valor.value = mobileFilterValor?.value || "";
  filtroFinalidade = mobileFilterFinalidade?.value || "";
  categoriaFiltro = "";
  filtroQuartos = mobileFilterQuartos?.value || "";
  filtroBairro = mobileFilterBairro?.value || "";
  document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
  const activePill = document.querySelector(`.hero-search-pills .pill[data-fin="${filtroFinalidade || "todos"}"]`);
  activePill?.classList.add("active");
  visibleCount = 12;
  render();
  closeMobileFilters();
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

document.querySelectorAll(".category-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-card").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    categoriaFiltro = btn.dataset.cat || "";
    filtroFinalidade = "";
    tipo.value = "";
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
    visibleCount = 12;
    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
    render();
  });
});

if (loadMore) {
  loadMore.addEventListener("click", () => {
    visibleCount += 12;
    render();
  });
}

mobileFilterTrigger?.addEventListener("click", openMobileFilters);
mobileFilterClose?.addEventListener("click", closeMobileFilters);
mobileFilterBackdrop?.addEventListener("click", closeMobileFilters);
mobileFilterApply?.addEventListener("click", applyMobileFilters);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileFilters();
});

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
        <div class="thumb-wrap"><img ${responsiveImageAttrs(i.imagem, `Imovel ${i.referencia}`, { width: 800, height: 600, sizes: "(max-width: 768px) 100vw, 33vw", loading: "lazy" })} /></div>
        <div class="card-badge">Destaque</div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${i.referencia || i._id}</span><span class="tag">${i.tipo}</span><span class="tag">${i.finalidade}</span></div>
          <h3>${i.endereco}</h3>
          <p>${i.cidade}</p>
          ${renderFeatureIcons(i, 4)}
          <p class="price-line">${i.venda !== "R$ 0,00" && i.venda !== "Consultar" ? `Venda: ${i.venda}` : ""}${i.venda !== "R$ 0,00" && i.venda !== "Consultar" && i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? " | " : ""}${i.locacao !== "R$ 0,00" && i.locacao !== "Consultar" ? `Locação: ${i.locacao}` : ""}</p>
          <div class="card-actions">
            <a class="btn btn-primary" href="/detalhe.html?id=${encodeURIComponent(refKey(i.referencia || i._id).raw)}">Ver detalhes</a>
            <a class="btn btn-outline" href="https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${encodeURIComponent(refKey(i.referencia || i._id).raw)}%20-%20${encodeURIComponent(i.endereco)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
    )
    .join("");
}

renderDestaques();
