(function () {
  const API = "/api/properties";
  let editingId = null;
  let uploadedImages = [];
  let currentPage = 1;
  const pageSize = 10;

  /* ---- auth check ---- */
  function getToken() {
    const t = localStorage.getItem("token");
    if (!t || t === "undefined") {
      window.location.href = "/admin/login";
      return null;
    }
    return t;
  }
  const token = getToken();

  async function api(path, opts = {}) {
    const headers = { Authorization: "Bearer " + token, ...opts.headers };
    if (!(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(API + path, { ...opts, headers });
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }
    return res;
  }

  /* ---- user info ---- */
  (function () {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        document.getElementById("dash-user-name").textContent = u.name || "Admin";
      }
    } catch {}
  })();

  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  });

  /* ---- load filters ---- */
  async function loadFilters() {
    const res = await api("?limit=1000");
    if (!res.ok) return;
    const data = await res.json();
    const tipos = new Set();
    const cidades = new Set();
    data.properties.forEach((p) => {
      if (p.tipo) tipos.add(p.tipo);
      if (p.cidade) cidades.add(p.cidade);
    });
    const tipoSel = document.getElementById("filter-tipo");
    const cidadeSel = document.getElementById("filter-cidade");
    tipos.forEach((t) => { const o = document.createElement("option"); o.value = t; o.textContent = t; tipoSel.appendChild(o); });
    cidades.forEach((c) => { const o = document.createElement("option"); o.value = c; o.textContent = c; cidadeSel.appendChild(o); });
  }

  /* ---- render table ---- */
  function renderPagination(page, pages, total) {
    const pagination = document.getElementById("dash-pagination");
    if (!pagination) return;
    if (pages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    const start = total === 0 ? 0 : ((page - 1) * pageSize) + 1;
    const end = Math.min(page * pageSize, total);
    const buttons = [];
    const windowSize = 3;
    const startPage = Math.max(1, page - windowSize);
    const endPage = Math.min(pages, page + windowSize);

    buttons.push(`<button type="button" class="page-btn" data-page="${Math.max(1, page - 1)}" ${page === 1 ? "disabled" : ""}>Anterior</button>`);
    if (startPage > 1) {
      buttons.push(`<button type="button" class="page-btn" data-page="1">1</button>`);
      if (startPage > 2) buttons.push(`<span class="page-ellipsis">...</span>`);
    }
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(`<button type="button" class="page-btn ${i === page ? "active" : ""}" data-page="${i}">${i}</button>`);
    }
    if (endPage < pages) {
      if (endPage < pages - 1) buttons.push(`<span class="page-ellipsis">...</span>`);
      buttons.push(`<button type="button" class="page-btn" data-page="${pages}">${pages}</button>`);
    }
    buttons.push(`<button type="button" class="page-btn" data-page="${Math.min(pages, page + 1)}" ${page === pages ? "disabled" : ""}>Próxima</button>`);

    pagination.innerHTML = `
      <div class="page-summary">${total === 0 ? "0 imóveis" : `${start}-${end} de ${total}`}</div>
      <div class="page-actions">${buttons.join("")}</div>
    `;

    pagination.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pageNum = Number(btn.dataset.page) || 1;
        loadProperties(pageNum);
      });
    });
  }

  async function loadProperties(page = currentPage) {
    currentPage = page;
    const params = new URLSearchParams();
    const q = document.getElementById("filter-search").value.trim();
    const tipo = document.getElementById("filter-tipo").value;
    const finalidade = document.getElementById("filter-finalidade").value;
    const cidade = document.getElementById("filter-cidade").value;
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    if (q) params.set("q", q);
    if (tipo) params.set("tipo", tipo);
    if (finalidade) params.set("finalidade", finalidade);
    if (cidade) params.set("cidade", cidade);

    const res = await api("?" + params.toString());
    if (!res.ok) return;
    const data = await res.json();
    const tbody = document.getElementById("dash-tbody");
    const empty = document.getElementById("dash-empty");
    const total = Number(data.total) || 0;
    const pages = Number(data.pages) || 1;
    currentPage = Number(data.page) || page;

    if (!data.properties.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      renderPagination(1, 1, 0);
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = data.properties
      .map(
        (p) =>
          `<tr class="${p.ativo === false ? 'row-inactive' : ''} ${p.destaque ? 'row-featured' : ''}">
            <td data-label="Ref"><strong>${esc(p.referencia || "-")}</strong></td>
            <td data-label="Tipo">${esc(p.tipo)}</td>
            <td data-label="Finalidade">${esc(p.finalidade)}</td>
            <td data-label="Cidade">${esc(p.cidade)}</td>
            <td data-label="Valor">${p.valorVenda ? "R$ " + fmt(p.valorVenda) : ""}${p.valorVenda && p.valorLocacao ? " / " : ""}${p.valorLocacao ? "R$ " + fmt(p.valorLocacao) + "/mês" : ""}</td>
            <td data-label="Imagens"><div class="thumb-list">${(p.imagens || []).slice(0, 4).map((i) => `<img src="${i}" alt="" />`).join("")}</div></td>
            <td data-label="Destaque">${p.destaque ? '<span class="status-pill status-pill-featured">Em destaque</span>' : '<span class="status-pill status-pill-muted">Normal</span>'}</td>
            <td data-label="Status">${p.ativo === false ? '<span class="status-pill status-pill-inactive">Inativo</span>' : '<span class="status-pill status-pill-active">Ativo</span>'}</td>
            <td data-label="Ações">
              <div class="actions">
                <button class="btn-edit" data-id="${p._id}">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                  Editar
                </button>
                <button class="btn-delete" data-id="${p._id}">
                  <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="3,6 5,6 21,6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                  Excluir
                </button>
              </div>
            </td>
          </tr>`
      )
      .join("");

    tbody.querySelectorAll(".btn-edit").forEach((b) => b.addEventListener("click", () => openEdit(b.dataset.id)));
    tbody.querySelectorAll(".btn-delete").forEach((b) => b.addEventListener("click", () => deleteProperty(b.dataset.id)));
    renderPagination(currentPage, pages, total);
  }

  function esc(s) {
    if (!s) return "";
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function fmt(n) { return Number(n).toLocaleString("pt-BR"); }

  function parseNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeMapUrl(value) {
    return String(value || "").trim();
  }

  /* ---- modal ---- */
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const form = document.getElementById("property-form");
  const formError = document.getElementById("form-error");
  const imageUpload = document.getElementById("image-upload");
  const imagePreview = document.getElementById("image-preview");
  const imagensInput = document.getElementById("imagens-input");

  function openModal(title, data) {
    editingId = data ? data._id : null;
    modalTitle.textContent = title;
    form.reset();
    formError.textContent = "";
    imagePreview.innerHTML = "";
    uploadedImages = data && data.imagens ? [...data.imagens] : [];
    renderPreview();

    if (data) {
      Object.keys(data).forEach((k) => {
        const el = form.elements[k];
        if (el) {
          if (el.type === "number") el.value = data[k] || 0;
          else if (el.type === "checkbox") el.checked = Boolean(data[k]);
          else if (k === "mapaUrl") el.value = data[k] || "";
          else el.value = data[k] || "";
        }
      });
      imagensInput.value = JSON.stringify(uploadedImages);
    } else {
      imagensInput.value = "[]";
    }
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
    editingId = null;
    form.reset();
    imagePreview.innerHTML = "";
    uploadedImages = [];
    imagensInput.value = "[]";
    formError.textContent = "";
  }

  document.getElementById("btn-novo").addEventListener("click", () => openModal("Novo imóvel", null));
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  /* ---- image upload ---- */
  imageUpload.addEventListener("change", async () => {
    const files = imageUpload.files;
    if (!files.length) return;
    const fd = new FormData();
    for (const f of files) fd.append("imagens", f);
    try {
      const res = await fetch("/api/properties/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      uploadedImages = uploadedImages.concat(data.urls);
      renderPreview();
      imagensInput.value = JSON.stringify(uploadedImages);
    } catch (err) {
      formError.textContent = "Erro ao fazer upload das imagens.";
    }
    imageUpload.value = "";
  });

  function renderPreview() {
    imagePreview.innerHTML = uploadedImages
      .map(
        (url, i) =>
          `<div style="position:relative;display:inline-block">
            <img src="${url}" />
            <button type="button" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:999px;border:0;background:#c0392b;color:#fff;font-size:12px;cursor:pointer;line-height:1" data-idx="${i}">&times;</button>
          </div>`
      )
      .join("");
    imagePreview.querySelectorAll("[data-idx]").forEach((b) =>
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.idx);
        uploadedImages.splice(idx, 1);
        imagensInput.value = JSON.stringify(uploadedImages);
        renderPreview();
      })
    );
  }

  /* ---- form submit ---- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";
    const fd = new FormData(form);
    const data = {};
    for (const [k, v] of fd.entries()) {
      if (k === "imagens") continue;
      const el = form.elements[k];
      if (el && el.type === "number") data[k] = parseNumber(v);
      else if (el && el.type === "checkbox") data[k] = el.checked;
      else if (k === "mapaUrl") data[k] = normalizeMapUrl(v);
      else data[k] = v;
    }
    form.querySelectorAll('input[type="checkbox"][name]').forEach((el) => {
      data[el.name] = el.checked;
    });
    try {
      data.imagens = JSON.parse(imagensInput.value || "[]");
    } catch {
      data.imagens = [];
    }
    if (!data.tipo || !data.finalidade || !data.cidade) {
      formError.textContent = "Preencha Tipo, Finalidade e Cidade.";
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await api("/" + editingId, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        res = await api("", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        formError.textContent = err.error || "Erro ao salvar.";
        return;
      }
      closeModal();
      loadProperties();
    } catch {
      formError.textContent = "Erro de conexão.";
    }
  });

  /* ---- edit ---- */
  async function openEdit(id) {
    const res = await api("/" + id);
    if (!res.ok) return;
    const data = await res.json();
    openModal("Editar imóvel", data.property);
  }

  /* ---- delete ---- */
  async function deleteProperty(id) {
    if (!confirm("Excluir este imóvel permanentemente?")) return;
    const res = await api("/" + id, { method: "DELETE" });
    if (res.ok) loadProperties();
  }

  /* ---- init ---- */
  loadFilters();
  loadProperties();

  document.querySelectorAll("#filter-search, #filter-tipo, #filter-finalidade, #filter-cidade").forEach((el) => {
    el.addEventListener("change", () => loadProperties(1));
    el.addEventListener("input", () => loadProperties(1));
  });

  const searchInput = document.getElementById("filter-search");
  const searchButton = document.getElementById("filter-search-btn");
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loadProperties(1);
    }
  });
  searchButton?.addEventListener("click", () => loadProperties(1));
})();
