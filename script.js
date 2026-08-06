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

function parseMeasure(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const match = String(value).match(/[\d.,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/\./g, "").replace(",", ".")) || 0;
}

function slugifyText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function propertySlug(item) {
  const ref = refKey(item.referencia || item._id).raw;
  const parts = [item.tipo, item.bairro || item.endereco, item.cidade].map(slugifyText).filter(Boolean);
  const base = parts.join("-") || "imovel";
  return `${base}-${ref}`.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeProperty(item, extra = {}) {
  const photos = extra.fotos || (Array.isArray(item.imagens) && item.imagens.length ? item.imagens : item.imagem ? [item.imagem] : []);
  const referencia = String(item.referencia || "");
  const tipo = item.tipo || "";
  const bairro = extra.bairro || item.bairro || "";
  const endereco = extra.endereco || item.endereco || bairro || "";
  const cidade = extra.cidade || item.cidade || "";
  return {
    _id: item._id || "",
    referencia,
    tipo,
    finalidade: item.finalidade || "",
    cidade,
    bairro,
    endereco,
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
    metragem: parseMeasure(item.metragem),
    mapaUrl: extra.mapaUrl || item.mapaUrl || "",
    valorVenda: Number(item.valorVenda || 0),
    valorLocacao: Number(item.valorLocacao || 0),
    venda: item.venda || formatMoney(item.valorVenda),
    locacao: item.locacao || formatMoney(item.valorLocacao),
    destaque: Boolean(item.destaque ?? extra.destaque),
    descricao: item.descricao || "",
    slug: propertySlug({ referencia, tipo, bairro, endereco, cidade }),
    ativo: item.ativo !== false,
  };
}

function refKey(value) {
  const raw = String(value ?? "").trim();
  const numeric = raw.replace(/^0+/, "") || "0";
  return { raw, numeric };
}

function isCloudinaryUrl(url) {
  return typeof url === "string" && /res\.cloudinary\.com/.test(url) && /\/upload\//.test(url);
}

function isVideoUrl(url) {
  return typeof url === "string" && (/\/video\//i.test(url) || /\.(mp4|mov|webm|ogv|avi|mkv)(\?|#|$)/i.test(url));
}

function mediaList(item) {
  const list = Array.isArray(item.imagens) ? item.imagens.filter(Boolean) : [];
  return list.length ? list : item.imagem ? [item.imagem] : [];
}

function previewMedia(item) {
  const list = mediaList(item);
  return list.find((url) => !isVideoUrl(url)) || list[0] || "";
}

function mediaThumbHTML(url, alt, options = {}) {
  const href = options.href || "";
  const classes = options.className || "";
  const content = isVideoUrl(url)
    ? `<video class="thumb-media ${classes}" src="${url}" muted playsinline autoplay loop preload="metadata"></video>`
    : `<img class="thumb-media ${classes}" ${responsiveImageAttrs(url, alt, options)} />`;
  if (!href) return content;
  return `<a class="thumb-link" href="${href}" aria-label="${options.label || alt}">${content}</a>`;
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
const heroValorTrigger = document.getElementById("hero-valor-trigger");
const heroValorPanel = document.getElementById("hero-valor-panel");
const heroValorApply = document.getElementById("hero-valor-apply");
const heroValorMinRange = document.getElementById("hero-valor-min-range");
const heroValorMaxRange = document.getElementById("hero-valor-max-range");
const heroValorMin = document.getElementById("hero-valor-min");
const heroValorMax = document.getElementById("hero-valor-max");
const heroValorRangeLabel = document.getElementById("hero-valor-range-label");
const heroSearchBtn = document.getElementById("hero-search-btn");
const mobileFilterTrigger = document.getElementById("mobile-filter-trigger");
const mobileFilterTriggerLabel = document.getElementById("mobile-filter-trigger-label");
const mobileFilterBackdrop = document.getElementById("mobile-filter-backdrop");
const mobileFilterSheet = document.getElementById("mobile-filter-sheet");
const mobileFilterCodeOnly = document.getElementById("mobile-filter-code-only");
const mobileFilterClose = document.getElementById("mobile-filter-close");
const mobileFilterClear = document.getElementById("mobile-filter-clear");
const mobileFilterApply = document.getElementById("mobile-filter-apply");
const codeSearchTrigger = document.getElementById("code-search-trigger");
const mobileFilterQ = document.getElementById("mobile-filter-q");
const mobileFilterFinalidade = document.getElementById("mobile-filter-finalidade");
const mobileFilterTipo = document.getElementById("mobile-filter-tipo");
const mobileFilterCidade = document.getElementById("mobile-filter-cidade");
const mobileFilterValor = document.getElementById("mobile-filter-valor");
const mobileFilterQuartos = document.getElementById("mobile-filter-quartos");
const mobileFilterVagas = document.getElementById("mobile-filter-vagas");
const mobileFilterSuites = document.getElementById("mobile-filter-suites");
const mobileFilterReferencia = document.getElementById("mobile-filter-referencia");
const mobileFilterBairro = document.getElementById("mobile-filter-bairro");
const cards = document.getElementById("cards");
const stats = document.getElementById("stats");
const loadMore = document.getElementById("load-more");
const trustCount = document.querySelector('[data-trust="count"] strong');
const heroSearchStatus = document.getElementById("hero-search-status");
const heroClearBtn = document.getElementById("hero-clear-btn");
const heroTitle = document.querySelector(".hero h1");
const heroSubtitle = document.querySelector(".hero-content > p");

if (heroSearchStatus) {
  heroSearchStatus.style.setProperty("display", "block", "important");
  heroSearchStatus.style.setProperty("position", "static", "important");
  heroSearchStatus.style.setProperty("background", "transparent", "important");
  heroSearchStatus.style.setProperty("background-image", "none", "important");
  heroSearchStatus.style.setProperty("border", "0", "important");
  heroSearchStatus.style.setProperty("border-radius", "0", "important");
  heroSearchStatus.style.setProperty("box-shadow", "none", "important");
  heroSearchStatus.style.setProperty("padding", "0", "important");
  heroSearchStatus.style.setProperty("margin", ".65rem 0 0 auto", "important");
  heroSearchStatus.style.setProperty("color", "#374151", "important");
  heroSearchStatus.style.setProperty("text-align", "right", "important");
  heroSearchStatus.style.setProperty("font-size", ".74rem", "important");
  heroSearchStatus.style.setProperty("line-height", "1.25", "important");
  heroSearchStatus.style.setProperty("align-self", "flex-end", "important");
  heroSearchStatus.style.setProperty("width", "auto", "important");
  heroSearchStatus.style.setProperty("max-width", "calc(100% - 1.4rem)", "important");
}

if (heroSubtitle) {
  heroSubtitle.style.setProperty("opacity", "1", "important");
  heroSubtitle.style.setProperty("display", "block", "important");
  heroSubtitle.style.setProperty("visibility", "visible", "important");
}

if (heroTitle) {
  heroTitle.style.setProperty("opacity", "1", "important");
  heroTitle.style.setProperty("display", "block", "important");
  heroTitle.style.setProperty("visibility", "visible", "important");
  heroTitle.style.setProperty("color", "#11633b", "important");
  heroTitle.style.setProperty("text-align", "left", "important");
  heroTitle.style.setProperty("justify-self", "start", "important");
  heroTitle.style.setProperty("margin-left", "0", "important");
  heroTitle.style.setProperty("margin-right", "auto", "important");
}

function syncHeroTextTheme() {
  const isMobile = window.matchMedia && window.matchMedia("(max-width: 638px)").matches;
  if (heroSubtitle) {
    heroSubtitle.style.setProperty("color", isMobile ? "#fff" : "#fff", "important");
  }
  if (heroTitle) {
    heroTitle.style.setProperty("text-align", "left", "important");
    heroTitle.style.setProperty("justify-self", "start", "important");
    heroTitle.style.setProperty("margin-left", "0", "important");
    heroTitle.style.setProperty("margin-right", "auto", "important");
  }
}

syncHeroTextTheme();
window.addEventListener("resize", syncHeroTextTheme);

let visibleCount = window.matchMedia && window.matchMedia("(max-width: 900px)").matches ? 6 : 12;
let filtroFinalidade = "";
let categoriaFiltro = "";
let filtroQuartos = "";
let filtroVagas = "";
let filtroSuites = "";
let filtroReferencia = "";
let filtroValorCustom = "";
let filtroBairro = "";

function matchesReference(item, query) {
  const value = String(query || "").trim();
  if (!value) return true;
  const ref = refKey(item.referencia || item._id);
  const haystack = `${ref.raw} ${ref.numeric}`.toLowerCase();
  return haystack.includes(value.toLowerCase().replace(/\s+/g, ""));
}

function parseValorRange(value) {
  const text = String(value || "").trim();
  if (!text) return { min: 6000, max: 20000000, custom: false };
  if (/^\d+-\d+$/.test(text)) {
    const [min, max] = text.split("-").map(Number);
    return { min, max, custom: true };
  }
  if (/^\d+\+$/.test(text)) {
    return { min: Number(text.replace(/\+$/, "")) || 6000, max: 20000000, custom: true };
  }
  return { min: 6000, max: 20000000, custom: false };
}

function syncValorPanel(min, max) {
  const low = Math.max(6000, Math.min(Number(min) || 6000, 20000000));
  const high = Math.max(low, Math.min(Number(max) || 20000000, 20000000));
  if (heroValorMinRange) heroValorMinRange.value = String(low);
  if (heroValorMaxRange) heroValorMaxRange.value = String(high);
  if (heroValorMin) heroValorMin.value = String(low);
  if (heroValorMax) heroValorMax.value = String(high);
  if (heroValorRangeLabel) heroValorRangeLabel.textContent = `${formatMoney(low)} - ${formatMoney(high)}`;
}

function updateValorTriggerLabel() {
  if (!heroValorTrigger) return;
  const text = String(filtroValorCustom || valor?.value || "").trim();
  if (!text) {
    heroValorTrigger.textContent = "Qualquer valor";
    return;
  }
  const preset = valor?.options?.[valor.selectedIndex]?.textContent || "Valor";
  const parsed = parseValorRange(text);
  heroValorTrigger.textContent = parsed.custom ? `${formatMoney(parsed.min)} - ${formatMoney(parsed.max)}` : preset;
}

function openValorPanel() {
  if (!heroValorPanel) return;
  const parsed = parseValorRange(filtroValorCustom || valor?.value);
  syncValorPanel(parsed.min, parsed.max);
  heroValorPanel.classList.add("open");
  heroValorPanel.setAttribute("aria-hidden", "false");
}

function closeValorPanel() {
  heroValorPanel?.classList.remove("open");
  heroValorPanel?.setAttribute("aria-hidden", "true");
}

function applyValorPanel() {
  if (!heroValorMin || !heroValorMax) return;
  const min = Math.max(6000, Math.min(Number(heroValorMin.value) || 6000, 20000000));
  const max = Math.max(min, Math.min(Number(heroValorMax.value) || 20000000, 20000000));
  if (min <= 6000 && max >= 20000000) {
    filtroValorCustom = "";
  } else {
    filtroValorCustom = `${min}-${max}`;
  }
  valor.value = "";
  updateValorTriggerLabel();
  render();
  closeValorPanel();
}

function updateTrustCount(total) {
  if (!trustCount) return;
  const n = Number(total) || 0;
  trustCount.textContent = n === 1 ? "1 imóvel" : `${n} imóveis`;
}

function buildAdvancedFilterCards() {
  document.querySelectorAll(".desktop-filter-options").forEach((container) => {
    const group = container.dataset.filterGroup;
    if (!group || container.childElementCount) return;
    const options = [1, 2, 3, 4, 5].map((value) => ({ value, label: value === 5 ? "5+" : String(value) }));
    container.innerHTML = options
      .map(
        ({ value, label }) => `<button type="button" class="desktop-filter-chip" data-filter-group="${group}" data-filter-value="${value}">${label}</button>`
      )
      .join("");
  });
}

function syncAdvancedFilterCards() {
  document.querySelectorAll(".desktop-filter-chip").forEach((btn) => {
    const group = btn.dataset.filterGroup;
    const value = btn.dataset.filterValue;
    const active = (group === "quartos" && filtroQuartos === value) ||
      (group === "suites" && filtroSuites === value) ||
      (group === "vagas" && filtroVagas === value);
    btn.classList.toggle("active", active);
  });
  if (mobileFilterTriggerLabel) {
    mobileFilterTriggerLabel.textContent = mobileFilterSheet?.classList.contains("open") ? "Ocultar filtros avançados" : "Filtros avançados";
  }
}

function applyAdvancedFilter(group, value) {
  const normalized = String(value || "");
  if (group === "quartos") filtroQuartos = filtroQuartos === normalized ? "" : normalized;
  if (group === "suites") filtroSuites = filtroSuites === normalized ? "" : normalized;
  if (group === "vagas") filtroVagas = filtroVagas === normalized ? "" : normalized;
  visibleCount = 12;
  render();
  syncAdvancedFilterCards();
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

function getFilteredProperties() {
  const term = q.value.toLowerCase().trim();
  return imoveis.filter((i) => {
    const hitTerm = !term || `${i.referencia} ${i.endereco} ${i.tipo}`.toLowerCase().includes(term);
    const hitTipo = !tipo.value || i.tipo === tipo.value;
    const hitCategoria = !categoriaFiltro || matchesCategory(i.tipo, categoriaFiltro);
    const hitFinalidade = !filtroFinalidade || matchesFinalidade(i.finalidade, filtroFinalidade);
    const hitCidade = !cidade.value || i.cidade === cidade.value;
    const hitValor = filterByValor(i, valor.value, filtroValorCustom);
    const hitQuartos = !filtroQuartos || Number(i.dormitorios || 0) >= Number(filtroQuartos);
    const hitVagas = !filtroVagas || Number(i.vagas || i.garagens || 0) >= Number(filtroVagas);
    const hitSuites = !filtroSuites || Number(i.suites || 0) >= Number(filtroSuites);
    const hitReferencia = matchesReference(i, filtroReferencia);
    const textBairro = `${i.bairro || ""} ${i.endereco || ""}`.toLowerCase();
    const hitBairro = !filtroBairro || textBairro.includes(filtroBairro.toLowerCase());
    return hitTerm && hitTipo && hitCategoria && hitFinalidade && hitCidade && hitValor && hitQuartos && hitVagas && hitSuites && hitReferencia && hitBairro;
  });
}

function formatResultsMessage(count, total) {
  if (count === 0) return "Não encontramos imóveis com esses critérios. Fale conosco para receber novas oportunidades.";
  return `${count} ${count === 1 ? "imóvel encontrado" : "imóveis encontrados"} de ${total} cadastrados.`;
}

function updateSearchSummaries(count, total) {
  const message = hasActiveFilters() ? formatResultsMessage(count, total) : "";
  if (stats) {
    stats.textContent = message;
    stats.classList.toggle("no-results", count === 0);
  }
  if (heroSearchStatus) {
    heroSearchStatus.textContent = hasActiveFilters() ? message : "";
  }
}

function hasActiveFilters() {
  return Boolean(
    q.value.trim() ||
    tipo.value ||
    cidade.value ||
    valor.value ||
    filtroValorCustom ||
    filtroFinalidade ||
    categoriaFiltro ||
    filtroQuartos ||
    filtroVagas ||
    filtroSuites ||
    filtroReferencia ||
    filtroBairro
  );
}

function updateClearButton() {
  heroClearBtn?.classList.toggle("show", hasActiveFilters());
  mobileFilterClear?.classList.toggle("show", hasActiveFilters());
}

function scrollToResultsIfAny(count) {
  if (!count) return false;
  document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
  return true;
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

function filterByValor(prop, range, customRange = "") {
  const activeRange = customRange || range;
  if (!activeRange) return true;
  const [min, max] = activeRange.split("-").map(Number);
  const val = parseCurrency(prop.venda) || parseCurrency(prop.locacao);
  if (activeRange.endsWith("+")) return val >= min;
  return val >= min && val <= max;
}

function validPriceLabel(label, value) {
  const text = String(value || "").trim();
  const numeric = parseCurrency(text);
  if (!text || numeric <= 0 || text === "Consultar") return "";
  return `${label}: ${text}`;
}

function priceLineHTML(item) {
  const line = [validPriceLabel("Venda", item.venda), validPriceLabel("Locação", item.locacao)].filter(Boolean).join(" | ");
  return line ? `<p class="price-line">${line}</p>` : "";
}

function mapPinHTML(item) {
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>';
  const href = String(item.mapaUrl || "").trim();
  if (!href) return `<span class="card-map-pin" aria-hidden="true">${icon}</span>`;
  return `<a class="card-map-pin card-map-link" href="${href}" target="_blank" rel="noopener" aria-label="Abrir mapa do imóvel">${icon}</a>`;
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
    const live = Array.isArray(payload.properties)
      ? payload.properties.map((item) => {
          const extra = typeof IMOVEIS_ENRICHMENT !== "undefined" ? IMOVEIS_ENRICHMENT[String(item.referencia)] : null;
          return normalizeProperty(item, extra || {});
        })
      : [];
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
  const filtrados = getFilteredProperties();
  updateSearchSummaries(filtrados.length, imoveis.length);
  updateClearButton();
  const exibidos = filtrados.slice(0, visibleCount);
  cards.innerHTML = filtrados.length
    ? exibidos
      .map(
        (i) => `
      <article class="card reveal show">
        <div class="thumb-wrap">
          ${mapPinHTML(i)}
          ${mediaThumbHTML(
            previewMedia(i),
            `Imovel ${i.referencia}`,
            {
              href: `/imovel/${encodeURIComponent(i.slug || propertySlug(i))}?ref=${encodeURIComponent(refKey(i.referencia || i._id).raw)}`,
              label: `Ver detalhes do imóvel ${i.referencia || i._id}`,
              width: 800,
              height: 600,
              sizes: "(max-width: 768px) 100vw, 33vw",
              loading: "lazy",
            }
          )}
        </div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${i.referencia || i._id}</span><span class="tag">${i.tipo}</span><span class="tag">${i.finalidade}</span></div>
          <h3>${i.endereco}</h3>
          <p>${i.cidade}</p>
          ${renderFeatureIcons(i, 4)}
          ${priceLineHTML(i)}
          <div class="card-actions">
            <a class="btn btn-primary" href="/imovel/${encodeURIComponent(i.slug || propertySlug(i))}?ref=${encodeURIComponent(refKey(i.referencia || i._id).raw)}">Ver detalhes</a>
            <a class="btn btn-outline" href="https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${encodeURIComponent(refKey(i.referencia || i._id).raw)}%20-%20${encodeURIComponent(i.endereco)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
      )
      .join("")
    : `<div class="no-results-box"><h3>Não encontramos imóveis com esses critérios.</h3><p>Fale conosco para receber novas oportunidades.</p><a class="btn btn-primary" href="https://wa.me/5567998126525" target="_blank" rel="noopener">Falar no WhatsApp</a></div>`;

  if (loadMore) {
    loadMore.style.display = filtrados.length > visibleCount ? "inline-flex" : "none";
  }

  return filtrados.length;
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
  if (mobileFilterVagas) mobileFilterVagas.value = filtroVagas;
  if (mobileFilterSuites) mobileFilterSuites.value = filtroSuites;
  if (mobileFilterReferencia) mobileFilterReferencia.value = filtroReferencia;
  if (mobileFilterBairro) mobileFilterBairro.value = filtroBairro;
  if (mobileFilterFinalidade) mobileFilterFinalidade.value = filtroFinalidade || "";
}

function openMobileFilters() {
  closeCodeSearchMode();
  syncMobileSheet();
  mobileFilterSheet?.classList.add("open");
  mobileFilterSheet?.setAttribute("aria-hidden", "false");
  mobileFilterTrigger?.setAttribute("aria-expanded", "true");
  if (mobileFilterTriggerLabel) mobileFilterTriggerLabel.textContent = "Ocultar filtros avançados";
}

function closeMobileFilters() {
  closeCodeSearchMode();
  mobileFilterSheet?.classList.remove("open");
  mobileFilterSheet?.setAttribute("aria-hidden", "true");
  mobileFilterTrigger?.setAttribute("aria-expanded", "false");
  if (mobileFilterTriggerLabel) mobileFilterTriggerLabel.textContent = "Filtros avançados";
}

function toggleMobileFilters() {
  if (mobileFilterSheet?.classList.contains("open")) closeMobileFilters();
  else openMobileFilters();
}

function openCodeSearch() {
  if (!mobileFilterSheet?.classList.contains("open")) openMobileFilters();
  mobileFilterSheet?.classList.add("code-only");
  mobileFilterReferencia?.focus();
  mobileFilterReferencia?.select?.();
}

function toggleCodeSearch() {
  if (mobileFilterSheet?.classList.contains("code-only")) {
    closeMobileFilters();
    return;
  }
  openCodeSearch();
}

function closeCodeSearchMode() {
  mobileFilterSheet?.classList.remove("code-only");
}

function applyMobileFilters() {
  q.value = mobileFilterQ?.value || "";
  tipo.value = mobileFilterTipo?.value || "";
  cidade.value = mobileFilterCidade?.value || "";
  valor.value = mobileFilterValor?.value || "";
  filtroValorCustom = "";
  filtroFinalidade = mobileFilterFinalidade?.value || "";
  categoriaFiltro = "";
  filtroQuartos = mobileFilterQuartos?.value || "";
  filtroVagas = mobileFilterVagas?.value || "";
  filtroSuites = mobileFilterSuites?.value || "";
  filtroReferencia = mobileFilterReferencia?.value || "";
  filtroBairro = mobileFilterBairro?.value || "";
  document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
  const activePill = document.querySelector(`.hero-search-pills .pill[data-fin="${filtroFinalidade || "todos"}"]`);
  activePill?.classList.add("active");
  visibleCount = 12;
  const total = render();
  syncAdvancedFilterCards();
  closeCodeSearchMode();
  closeMobileFilters();
  scrollToResultsIfAny(total);
}

function clearFilters() {
  q.value = "";
  tipo.value = "";
  cidade.value = "";
  valor.value = "";
  filtroFinalidade = "";
  categoriaFiltro = "";
  filtroQuartos = "";
  filtroVagas = "";
  filtroSuites = "";
  filtroReferencia = "";
  filtroValorCustom = "";
  filtroBairro = "";
  document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
  document.querySelector('.hero-search-pills .pill[data-fin="todos"]')?.classList.add("active");
  visibleCount = 12;
  render();
  updateValorTriggerLabel();
  syncAdvancedFilterCards();
  closeCodeSearchMode();
}

function applyHeroSearch() {
  visibleCount = 12;
  const total = render();
  scrollToResultsIfAny(total);
}

[q, tipo, cidade, valor].forEach((el) => el.addEventListener("input", () => {
  visibleCount = 12;
  render();
}));

valor?.addEventListener("change", () => {
  filtroValorCustom = "";
  updateValorTriggerLabel();
});

heroValorTrigger?.addEventListener("click", () => {
  const open = heroValorPanel?.classList.contains("open");
  if (open) closeValorPanel();
  else openValorPanel();
});

heroValorApply?.addEventListener("click", applyValorPanel);

[heroValorMinRange, heroValorMaxRange, heroValorMin, heroValorMax].forEach((el) => {
  el?.addEventListener("input", () => {
    const min = heroValorMinRange ? Number(heroValorMinRange.value) : Number(heroValorMin?.value || 6000);
    const max = heroValorMaxRange ? Number(heroValorMaxRange.value) : Number(heroValorMax?.value || 20000000);
    syncValorPanel(min, max);
  });
});

document.addEventListener("click", (e) => {
  if (!heroValorPanel || !heroValorTrigger) return;
  if (heroValorPanel.contains(e.target) || heroValorTrigger.contains(e.target)) return;
  closeValorPanel();
});

[mobileFilterQuartos, mobileFilterVagas, mobileFilterSuites].forEach((el) => {
  el?.addEventListener("change", () => {
    // Keep the sheet state in sync until the user applies the filters.
  });
});

document.addEventListener("click", (e) => {
  const chip = e.target.closest?.(".desktop-filter-chip");
  if (!chip) return;
  applyAdvancedFilter(chip.dataset.filterGroup, chip.dataset.filterValue);
});

q?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyHeroSearch();
  }
});

document.querySelectorAll(".hero-search-pills .pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filtroFinalidade = btn.dataset.fin === "todos" ? "" : btn.dataset.fin;
    visibleCount = 12;
    const total = render();
    scrollToResultsIfAny(total);
  });
});

heroClearBtn?.addEventListener("click", clearFilters);

document.querySelectorAll(".category-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-card").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    categoriaFiltro = btn.dataset.cat || "";
    filtroFinalidade = "";
    tipo.value = "";
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
    visibleCount = 12;
    const total = render();
    scrollToResultsIfAny(total);
  });
});

heroSearchBtn?.addEventListener("click", applyHeroSearch);

heroClearBtn?.addEventListener("click", clearFilters);

if (loadMore) {
  loadMore.addEventListener("click", () => {
    visibleCount += 12;
    render();
  });
}

mobileFilterTrigger?.addEventListener("click", toggleMobileFilters);
mobileFilterClose?.addEventListener("click", closeMobileFilters);
mobileFilterClear?.addEventListener("click", clearFilters);
mobileFilterBackdrop?.addEventListener("click", closeMobileFilters);
mobileFilterApply?.addEventListener("click", applyMobileFilters);
codeSearchTrigger?.addEventListener("click", toggleCodeSearch);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileFilters();
});

populateSelects();
buildAdvancedFilterCards();
updateValorTriggerLabel();
render();
syncAdvancedFilterCards();
closeMobileFilters();
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
        <div class="thumb-wrap">
          ${mapPinHTML(i)}
          ${mediaThumbHTML(
            previewMedia(i),
            `Imovel ${i.referencia}`,
            {
              href: `/imovel/${encodeURIComponent(i.slug || propertySlug(i))}?ref=${encodeURIComponent(refKey(i.referencia || i._id).raw)}`,
              label: `Ver detalhes do imóvel ${i.referencia || i._id}`,
              width: 800,
              height: 600,
              sizes: "(max-width: 768px) 100vw, 33vw",
              loading: "lazy",
            }
          )}
        </div>
        <div class="card-badge">Destaque</div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${i.referencia || i._id}</span><span class="tag">${i.tipo}</span><span class="tag">${i.finalidade}</span></div>
          <h3>${i.endereco}</h3>
          <p>${i.cidade}</p>
          ${renderFeatureIcons(i, 4)}
          ${priceLineHTML(i)}
          <div class="card-actions">
            <a class="btn btn-primary" href="/imovel/${encodeURIComponent(i.slug || propertySlug(i))}?ref=${encodeURIComponent(refKey(i.referencia || i._id).raw)}">Ver detalhes</a>
            <a class="btn btn-outline" href="https://wa.me/5567998126525?text=Ol%C3%A1!%20Tenho%20interesse%20no%20im%C3%B3vel%20ref%20${encodeURIComponent(refKey(i.referencia || i._id).raw)}%20-%20${encodeURIComponent(i.endereco)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
    )
    .join("");
}

renderDestaques();
