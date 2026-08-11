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

  function isCloudinaryUrl(url) {
    return typeof url === "string" && /res\.cloudinary\.com/.test(url) && /\/upload\//.test(url);
  }

  function isVideoUrl(url) {
    return typeof url === "string" && (/\/video\//i.test(url) || /\.(mp4|mov|webm|ogv|avi|mkv)(\?|#|$)/i.test(url));
  }

  function cloudinaryVariant(url, width, height) {
    if (!isCloudinaryUrl(url)) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`);
  }

  function cloudinarySrcset(url, width, height) {
    return [400, 800, 1200]
      .map((w) => `${cloudinaryVariant(url, w, Math.round((height || 800) * (w / (width || 1200))))} ${w}w`)
      .join(", ");
  }

  function responsiveImageAttrs(url, alt, options = {}) {
    const { width, height, sizes, loading = "lazy", fetchpriority } = options;
    const parts = [`src="${isCloudinaryUrl(url) ? cloudinaryVariant(url, width || 1200, height || 800) : url}"`, `alt="${alt}"`];

    if (isCloudinaryUrl(url)) {
      parts.push(`srcset="${cloudinarySrcset(url, width || 1200, height || 800)}"`);
      if (sizes) parts.push(`sizes="${sizes}"`);
    }

    if (width) parts.push(`width="${width}"`);
    if (height) parts.push(`height="${height}"`);
    if (loading) parts.push(`loading="${loading}"`);
    if (fetchpriority) parts.push(`fetchpriority="${fetchpriority}"`);
    return parts.join(" ");
  }

  function mediaHTML(url, alt, options = {}) {
    const { width, height, sizes, loading = "lazy", fetchpriority, className = "", controls = false, id = "" } = options;
    if (isVideoUrl(url)) {
      return `<video${id ? ` id="${id}"` : ""} class="${className}" src="${url}" ${controls ? "controls" : "muted autoplay loop"} playsinline preload="metadata" ${width ? `width="${width}"` : ""} ${height ? `height="${height}"` : ""}></video>`;
    }
    return `<img${id ? ` id="${id}"` : ""} class="${className}" ${responsiveImageAttrs(url, alt, { width, height, sizes, loading, fetchpriority })} />`;
  }

  function normalizeProperty(item, extra = {}) {
    const photos = extra.fotos || (Array.isArray(item.imagens) && item.imagens.length ? item.imagens : item.imagem ? [item.imagem] : []);
    const referencia = String(item.referencia || "");
    const tipo = item.tipo || "";
    const bairro = extra.bairro || item.bairro || "";
    const endereco = extra.endereco || item.endereco || item.bairro || "";
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
      piscina: Boolean(item.piscina ?? extra.piscina),
      churrasqueira: Boolean(item.churrasqueira ?? extra.churrasqueira),
      quintal: Boolean(item.quintal ?? extra.quintal),
      jardim: Boolean(item.jardim ?? extra.jardim),
      edicula: Boolean(item.edicula ?? extra.edicula),
      lavanderia: Boolean(item.lavanderia ?? extra.lavanderia),
      closet: Boolean(item.closet ?? extra.closet),
      escritorio: Boolean(item.escritorio ?? extra.escritorio),
      moveisPlanejados: Boolean(item.moveisPlanejados ?? extra.moveisPlanejados),
      imovelMobiliado: Boolean(item.imovelMobiliado ?? extra.imovelMobiliado),
      arCondicionado: Boolean(item.arCondicionado ?? extra.arCondicionado),
      energiaSolar: Boolean(item.energiaSolar ?? extra.energiaSolar),
      garagemCoberta: Boolean(item.garagemCoberta ?? extra.garagemCoberta),
      portaoEletronico: Boolean(item.portaoEletronico ?? extra.portaoEletronico),
      cercaEletrica: Boolean(item.cercaEletrica ?? extra.cercaEletrica),
      acessibilidade: Boolean(item.acessibilidade ?? extra.acessibilidade),
      aceitaFinanciamento: Boolean(item.aceitaFinanciamento ?? extra.aceitaFinanciamento),
      aceitaFGTS: Boolean(item.aceitaFGTS ?? extra.aceitaFGTS),
      aceitaProposta: Boolean(item.aceitaProposta ?? extra.aceitaProposta),
      aceitaPermuta: Boolean(item.aceitaPermuta ?? extra.aceitaPermuta),
      aceitaVeiculo: Boolean(item.aceitaVeiculo ?? extra.aceitaVeiculo),
      documentacaoRegular: Boolean(item.documentacaoRegular ?? extra.documentacaoRegular),
      escriturado: Boolean(item.escriturado ?? extra.escriturado),
      area: extra.area || item.area || (item.metragem ? `${item.metragem} m²` : ""),
      metragem: parseMeasure(item.metragem),
      mapaUrl: extra.mapaUrl || item.mapaUrl || "",
      valorVenda: Number(item.valorVenda || 0),
      valorLocacao: Number(item.valorLocacao || 0),
      venda: item.venda || formatMoney(item.valorVenda),
      locacao: item.locacao || formatMoney(item.valorLocacao),
      destaque: Boolean(item.destaque ?? extra.destaque),
      tourVirtual: Boolean(extra.tourVirtual ?? item.tourVirtual),
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

  function acaoLabel(value) {
    if (value === "ambos") return "Venda e locação";
    if (value === "venda") return "Venda";
    return "Locação";
  }

  function normalizeText(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function similarGroup(type) {
    const t = normalizeText(type);
    if (t.includes("terreno") || t.includes("lote") || t.includes("area")) return "land";
    if (t.includes("fazenda") || t.includes("chacara") || t.includes("sitio")) return "rural";
    if (t.includes("loja") || t.includes("sala") || t.includes("predio") || t.includes("comercial")) return "commercial";
    return "residential";
  }

  function matchesSimilarType(item, base) {
    return similarGroup(item.tipo) === similarGroup(base.tipo);
  }

  function validPriceLabel(label, value) {
    const text = String(value || "").trim();
    const numeric = parseFloat(text.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
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

  function mapEmbedSrc(item) {
    const href = String(item.mapaUrl || "").trim();
    const query = encodeURIComponent(`${item.endereco || ""}, ${item.cidade || ""}`.trim());
    if (!href) {
      return `https://www.google.com/maps?q=${query}&output=embed`;
    }

    if (/output=embed/i.test(href)) return href;

    if (/google\.com\/maps/i.test(href) || /maps\.app\.goo\.gl/i.test(href) || /goo\.gl\/maps/i.test(href)) {
      return `https://www.google.com/maps?q=${query}&output=embed`;
    }

    return "";
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
      bairro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
      cidade: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V8l6-3 6 3v12"/><path d="M9 20v-5h6v5"/></svg>',
      finalidade: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V5h14v14z"/><path d="M9 9h6M9 13h6"/></svg>',
      venda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16"/><path d="M7 17V7h10v10"/><path d="M10 14h4"/></svg>',
      locacao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9l7-4 7 4v10"/><path d="M9 19v-5h6v5"/></svg>',
    };
    return icons[type] || icons.dormitorios;
  }

  function detailCards(item, acao, preco) {
    const cards = [];
    const pushText = (label, value) => {
      if (value === null || value === undefined || value === "" || value === 0 || value === "0" || value === "0 m²" || value === "R$ 0,00") return;
      cards.push({ type: "text", label, value });
    };
    const pushFeature = (key, label, value) => {
      const n = Number(value) || 0;
      if (!n) return;
      cards.push({ type: "feature", key, label, value: n });
    };

    pushText("Metragem", item.area && item.area !== "0" && item.area !== "0 m²" ? item.area : (item.metragem ? `${item.metragem} m²` : ""));
    pushFeature("suites", "Suíte", item.suites);
    pushFeature("cozinhas", "Cozinha", item.cozinhas);
    pushFeature("vagas", "Garagem", item.garagens || item.vagas);
    pushFeature("dormitorios", "Dormitório", item.dormitorios);
    pushFeature("banheiros", "Banheiro", item.banheiros);
    pushFeature("salas", "Sala", item.salas);
    pushFeature("areaServico", "Área de serviço", item.areaServico);
    pushFeature("copa", "Copa", item.copa);
    return cards;
  }

  function detailMediaList(item) {
    const list = Array.isArray(item.fotos) && item.fotos.length ? item.fotos : (item.imagem ? [item.imagem] : []);
    return list.length ? list : [];
  }

  function rawPriceToText(value) {
    const n = Number(value) || 0;
    return n > 0 ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n) : "";
  }

  function propertyFeatureEntries(item) {
    return [
      { key: "suites", label: "Suíte", value: item.suites },
      { key: "dormitorios", label: "Dormitório", value: item.dormitorios },
      { key: "banheiros", label: "Banheiro", value: item.banheiros },
      { key: "salas", label: "Sala", value: item.salas },
      { key: "cozinhas", label: "Cozinha", value: item.cozinhas },
      { key: "areaServico", label: "Área de serviço", value: item.areaServico },
      { key: "copa", label: "Copa", value: item.copa },
    ].filter((entry) => Number(entry.value) > 0);
  }

  function booleanFeatureEntries(item) {
    return [
      { label: "Piscina", value: item.piscina },
      { label: "Área gourmet", value: item.areaGourmet },
      { label: "Churrasqueira", value: item.churrasqueira },
      { label: "Varanda", value: item.varandas },
      { label: "Quintal", value: item.quintal },
      { label: "Jardim", value: item.jardim },
      { label: "Edícula", value: item.edicula },
      { label: "Lavanderia", value: item.lavanderia },
      { label: "Closet", value: item.closet },
      { label: "Escritório", value: item.escritorio },
      { label: "Móveis planejados", value: item.moveisPlanejados },
      { label: "Imóvel mobiliado", value: item.imovelMobiliado },
      { label: "Ar-condicionado", value: item.arCondicionado },
      { label: "Energia solar", value: item.energiaSolar },
      { label: "Garagem coberta", value: item.garagemCoberta },
      { label: "Portão eletrônico", value: item.portaoEletronico },
      { label: "Cerca elétrica", value: item.cercaEletrica },
      { label: "Acessibilidade", value: item.acessibilidade },
    ].filter((entry) => Boolean(entry.value));
  }

  function commercialFeatureEntries(item) {
    return [
      { label: "Aceita financiamento", value: item.aceitaFinanciamento },
      { label: "Aceita FGTS", value: item.aceitaFGTS },
      { label: "Aceita proposta", value: item.aceitaProposta },
      { label: "Aceita permuta", value: item.aceitaPermuta },
      { label: "Aceita veículo", value: item.aceitaVeiculo },
      { label: "Documentação regular", value: item.documentacaoRegular },
      { label: "Imóvel escriturado", value: item.escriturado },
    ].filter((entry) => Boolean(entry.value));
  }

  function renderFeatureIcons(item, limit = 4) {
    const entries = propertyFeatureEntries(item).slice(0, limit);
    if (!entries.length) return "";
    return `<div class="feature-icons">${entries.map((entry) => {
      const count = Number(entry.value) || 0;
      return `<span class="feature-icon" title="${count} ${entry.label}${count > 1 ? 's' : ''}" aria-label="${count} ${entry.label}${count > 1 ? 's' : ''}">${featureIcon(entry.key)}${count > 1 ? `<strong>${count}</strong>` : ""}</span>`;
    }).join("")}</div>`;
  }

  async function loadProperties() {
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
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const routeSlug = pathParts[0] === "imovel" ? decodeURIComponent(pathParts.slice(1).join("/")) : "";
  const refFromSlug = routeSlug.match(/-(\d+)$/)?.[1] || "";
  const target = refKey(refParam || refFromSlug);
  const imovelRaw = propriedades.find((item) => {
    const ref = refKey(item.referencia);
    return (
      item.slug === routeSlug ||
      ref.raw === target.raw ||
      ref.numeric === target.numeric ||
      item._id === refParam ||
      (!refParam && !routeSlug && item.referencia)
    );
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
    const fotos = detailMediaList(imovel);
    const acao = acaoLabel(imovel.finalidade);
    const preco = rawPriceToText(imovel.valorVenda) || rawPriceToText(imovel.valorLocacao)
      || (imovel.venda !== "R$ 0,00" && imovel.venda !== "Consultar" ? imovel.venda : "")
      || (imovel.locacao !== "R$ 0,00" && imovel.locacao !== "Consultar" ? imovel.locacao : "")
      || null;
    const highlightCards = detailCards(imovel, acao, preco);
    const amenities = booleanFeatureEntries(imovel);
    const commercialConditions = commercialFeatureEntries(imovel);

    const finalidadeLabel = imovel.finalidade === "venda" ? "à venda" : imovel.finalidade === "aluguel" ? "para locação" : "à venda e locação";
    const bedrooms = Number(imovel.dormitorios) || 0;
    const vagas = Number(imovel.vagas || imovel.garagens) || 0;
    const areaText = String(imovel.area || "").trim();
    const titleLocation = imovel.bairro
      ? `${imovel.bairro}${imovel.cidade ? ` em ${imovel.cidade}` : ""}`
      : (imovel.cidade || imovel.endereco || "Aquidauana");
    const descLocation = [imovel.bairro || imovel.endereco || "", imovel.cidade || ""].filter(Boolean).join(", ");
    const roomsText = bedrooms ? `${bedrooms} ${bedrooms === 1 ? "quarto" : "quartos"}` : "";
    const vagasText = vagas ? `${vagas} ${vagas === 1 ? "vaga" : "vagas"}` : "";
    const seoTitle = `${imovel.tipo}${roomsText ? ` com ${roomsText}` : ""} ${finalidadeLabel} no ${titleLocation} | Geraldo Gama`;
    const seoDesc = `${imovel.tipo} ${finalidadeLabel} no ${descLocation}${[roomsText, vagasText, areaText].filter(Boolean).length ? `, com ${[roomsText, vagasText, areaText].filter(Boolean).join(", ")}` : ""}. Consulte preço, fotos e agende uma visita.`;
    document.title = seoTitle;
    const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    const slugPath = `/imovel/${encodeURIComponent(imovel.slug || propertySlug(imovel))}`;
    const slugUrl = `https://geraldogamaimv.com.br${slugPath}`;
    try { history.replaceState(null, "", slugPath); } catch {}
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
    const semelhantes = propriedades
      .filter((item) => item.referencia !== imovel.referencia)
      .filter((item) => matchesSimilarType(item, imovel))
      .sort((a, b) => {
        const sameTypeA = a.tipo === imovel.tipo ? 1 : 0;
        const sameTypeB = b.tipo === imovel.tipo ? 1 : 0;
        const sameCityA = a.cidade === imovel.cidade ? 1 : 0;
        const sameCityB = b.cidade === imovel.cidade ? 1 : 0;
        return (sameTypeB - sameTypeA) || (sameCityB - sameCityA);
      })
      .slice(0, 3);

  box.innerHTML = `
    <article class="detail-wrap reveal show">
      <button type="button" class="detail-back-btn" id="detail-back-btn" aria-label="Voltar para a página anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        <span>Voltar</span>
      </button>
      <div class="detail-badge-destaque">Em destaque</div>
      <div class="gallery-premium">
        <div class="gallery-layout">
          <div class="gallery-main" id="gallery-main">
            ${mediaHTML(fotos[0], `Imagem 1 do imóvel ${imovel.referencia}`, { id: "gallery-main-img", width: 1200, height: 800, sizes: "(max-width: 768px) 100vw, 68vw", loading: "eager", fetchpriority: "high", className: "gallery-main-img", controls: true })}
            <button type="button" class="gallery-open-btn" id="gallery-open-btn" aria-label="Abrir foto em tela cheia">Ampliar</button>
            <div class="gallery-counter"><span id="gallery-idx">1</span> / ${fotos.length} fotos</div>
            ${fotos.length > 1 ? '<button class="slide-btn prev" id="prev-photo" aria-label="Foto anterior">\u2039</button><button class="slide-btn next" id="next-photo" aria-label="Próxima foto">\u203A</button>' : ''}
          </div>
          <div class="gallery-thumbs gallery-thumbs-side" id="gallery-thumbs">
            ${fotos.slice(0, 4).map((f, i) => `<button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Foto ${i + 1}">${mediaHTML(f, `Miniatura ${i + 1}`, { width: 200, height: 150, loading: "lazy", className: "gallery-thumb-media" })}</button>`).join('')}
          </div>
        </div>
        ${fotos.length > 1 ? `
          <div class="gallery-dots" id="gallery-dots" aria-label="Navegação da galeria">
            ${fotos.map((_, i) => `<button type="button" class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir para a foto ${i + 1}"></button>`).join('')}
          </div>
        ` : ''}
        ${fotos.length > 4 ? `
          <div class="gallery-thumbs gallery-thumbs-bottom" id="gallery-thumbs-bottom">
            ${fotos.slice(4).map((f, idx) => {
              const i = idx + 4;
              return `<button class="gallery-thumb" data-index="${i}" aria-label="Foto ${i + 1}">${mediaHTML(f, `Miniatura ${i + 1}`, { width: 200, height: 150, loading: "lazy", className: "gallery-thumb-media" })}</button>`;
            }).join('')}
          </div>
        ` : ''}
      </div>
      <div class="detail-intro">
        <p class="detail-kicker">${acao.toUpperCase()} | ${imovel.tipo}</p>
        <h1>${imovel.endereco}</h1>
        <div class="detail-location-line">
          ${imovel.bairro ? `<span class="detail-location-pill"><span class="detail-location-icon">${featureIcon("bairro")}</span>${imovel.bairro}</span>` : ''}
          ${imovel.cidade ? `<span class="detail-location-pill"><span class="detail-location-icon">${featureIcon("cidade")}</span>${imovel.cidade}</span>` : ''}
        </div>
        ${preco ? `<div class="detail-price-highlight">${preco}</div>` : ''}
        <a class="detail-whatsapp-cta" href="https://wa.me/5567998126525?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel ref ${imovel.referencia} - ${imovel.endereco}.`)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-7.6-11.5A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8.5v.5z"/></svg>
          <span>Tenho Interesse</span>
        </a>
      </div>
      <div class="detail-content">
        <div class="detail-grid detail-grid-premium">
          ${highlightCards.map((item) => item.type === "text" ? `<div class="detail-card detail-card-text"><span>${item.label}</span><strong>${item.value}</strong></div>` : `<div class="detail-card detail-card-feature" title="${item.label}: ${item.value}"><div class="detail-card-head"><span class="detail-card-icon">${featureIcon(item.key)}</span><span class="detail-card-label">${item.label}</span><strong class="detail-card-value">${item.value}</strong></div></div>`).join("")}
        </div>

        <p class="descricao-imovel">
          ${imovel.tipo} localizado em ${imovel.cidade}, na região ${imovel.endereco}. Disponibilidade para ${acao.toLowerCase()}.
          Para condições comerciais atualizadas e visita presencial, fale direto com a equipe da Imobiliária Geraldo Gama.
        </p>

        ${(amenities.length || commercialConditions.length) ? `
          <div class="detail-feature-lists">
            ${amenities.length ? `
              <section class="detail-feature-list">
                <h3>Características</h3>
                <ul>
                  ${amenities.map((entry) => `<li><span class="detail-check">✓</span><span>${entry.label}</span></li>`).join("")}
                </ul>
              </section>
            ` : ''}
            ${commercialConditions.length ? `
              <section class="detail-feature-list">
                <h3>Condições comerciais</h3>
                <ul>
                  ${commercialConditions.map((entry) => `<li><span class="detail-check">✓</span><span>${entry.label}</span></li>`).join("")}
                </ul>
              </section>
            ` : ''}
          </div>
        ` : ''}

        <div class="detail-map-block">
          <p class="detail-map-title">${imovel.endereco}</p>
          <div class="detail-map-frame">
            ${mapEmbedSrc(imovel)
              ? `<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapEmbedSrc(imovel)}" title="Mapa do imóvel"></iframe>`
              : `<a href="${imovel.mapaUrl}" target="_blank" rel="noopener">Abrir mapa</a>`}
          </div>
        </div>

        <div class="detail-actions">
          <a class="btn btn-primary" href="https://wa.me/5567998126525?text=Olá!%20Quero%20falar%20sobre%20este%20imóvel%20ref%20${imovel.referencia}." target="_blank" rel="noopener">Falar sobre este imóvel</a>
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

        ${semelhantes.length ? `
    <section class="similar-section detail-similar-full">
      <div class="section-title-wrap">
        <p class="eyebrow">Semelhantes</p>
        <h2>Imóveis parecidos</h2>
      </div>
      <div class="cards similar-cards">
        ${semelhantes.map((item) => {
          const extra = typeof IMOVEIS_ENRICHMENT !== "undefined" ? IMOVEIS_ENRICHMENT[item.referencia] : null;
          const foto = (extra && extra.fotos && extra.fotos[0]) || item.imagem;
          const endereco = (extra && extra.endereco) || item.endereco;
          const cidade = (extra && extra.cidade) || item.cidade;
      const url = `/imovel/${encodeURIComponent(item.slug || propertySlug(item))}?ref=${encodeURIComponent(refKey(item.referencia || item._id).raw)}`;
          return `
            <article class="card reveal show card-similar">
              <div class="thumb-wrap">
                ${mapPinHTML(item)}
                ${mediaHTML(foto, `Imóvel ${item.referencia}`, { width: 800, height: 600, sizes: "(max-width: 768px) 100vw, 33vw", loading: "lazy", className: "card-media" })}
              </div>
              <div class="card-body">
                <div class="meta"><span class="tag">Ref ${item.referencia || item._id}</span><span class="tag">${item.tipo}</span><span class="tag">${item.finalidade}</span></div>
                <h3>${endereco}</h3>
                <p>${cidade}</p>
                ${renderFeatureIcons(item, 4)}
                ${priceLineHTML(item)}
                <div class="card-actions">
                  <a class="btn btn-primary" href="${url}">Ver detalhes</a>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>` : ''}

    <div class="gallery-modal" id="gallery-modal" aria-hidden="true">
      <button type="button" class="gallery-modal-close" id="gallery-modal-close" aria-label="Fechar">×</button>
      <button type="button" class="gallery-modal-nav prev" id="gallery-modal-prev" aria-label="Foto anterior">‹</button>
      <figure class="gallery-modal-figure">
        <img ${responsiveImageAttrs(fotos[0], `Foto ampliada 1 do imóvel ${imovel.referencia}`, { width: 1600, height: 1067, loading: "eager" })} id="gallery-modal-img" />
        <figcaption id="gallery-modal-caption">Foto 1 de ${fotos.length}</figcaption>
      </figure>
      <button type="button" class="gallery-modal-nav next" id="gallery-modal-next" aria-label="Próxima foto">›</button>
    </div>
  `;

  let photoIndex = 0;
  let modalOpen = false;
  let zoomed = false;

  const backBtn = document.getElementById("detail-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "/#imoveis";
    });
  }
  const mainImg = document.getElementById("gallery-main-img");
  const counterEl = document.getElementById("gallery-idx");
  const thumbs = document.querySelectorAll(".gallery-thumb");
  const dots = document.querySelectorAll(".gallery-dot");
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
    mainImg.alt = `Imagem ${idx + 1} do imóvel ${imovel.referencia}`;
    if (isCloudinaryUrl(fotos[idx])) mainImg.srcset = cloudinarySrcset(fotos[idx], 1200, 800);
    else mainImg.removeAttribute("srcset");
    counterEl.textContent = idx + 1;
    thumbs.forEach((t, i) => t.classList.toggle("active", i === idx));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === idx));
    const activeThumb = thumbs[idx];
    if (activeThumb) activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    if (modalOpen) {
      modalImg.src = fotos[idx];
      modalImg.alt = `Foto ampliada ${idx + 1} do imóvel ${imovel.referencia}`;
      if (isCloudinaryUrl(fotos[idx])) modalImg.srcset = cloudinarySrcset(fotos[idx], 1600, 1067);
      else modalImg.removeAttribute("srcset");
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
  dots.forEach((d) => d.addEventListener("click", () => renderActive(parseInt(d.dataset.index, 10))));
  if (openBtn) openBtn.addEventListener("click", () => openModal(photoIndex));
  mainImg.addEventListener("click", () => openModal(photoIndex));
  if (modalPrev) modalPrev.addEventListener("click", () => step(-1));
  if (modalNext) modalNext.addEventListener("click", () => step(1));
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modalImg.addEventListener("click", () => { zoomed = !zoomed; modalImg.classList.toggle("zoomed", zoomed); });

  let touchStartX = 0;
  const galleryMain = document.getElementById("gallery-main");
  if (galleryMain) {
    galleryMain.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    galleryMain.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) step(-1); else step(1);
      }
    }, { passive: true });
  }
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
  const shareAction = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Imóvel ${imovel.referencia} - Imobiliária Geraldo Gama`, url: window.location.href });
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener");
    }
  };
  if (shareNative) shareNative.addEventListener("click", shareAction);

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
