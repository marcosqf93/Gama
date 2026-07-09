(function () {
  const API = "/api/properties";
  let editingId = null;
  let uploadedImages = [];

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
    const res = await api("");
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
  async function loadProperties() {
    const params = new URLSearchParams();
    const q = document.getElementById("filter-search").value.trim();
    const tipo = document.getElementById("filter-tipo").value;
    const finalidade = document.getElementById("filter-finalidade").value;
    const cidade = document.getElementById("filter-cidade").value;
    if (q) params.set("q", q);
    if (tipo) params.set("tipo", tipo);
    if (finalidade) params.set("finalidade", finalidade);
    if (cidade) params.set("cidade", cidade);

    const res = await api("?" + params.toString());
    if (!res.ok) return;
    const data = await res.json();
    const tbody = document.getElementById("dash-tbody");
    const empty = document.getElementById("dash-empty");

    if (!data.properties.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = data.properties
      .map(
        (p) =>
          `<tr>
            <td><strong>${esc(p.referencia || "-")}</strong></td>
            <td>${esc(p.tipo)}</td>
            <td>${esc(p.finalidade)}</td>
            <td>${esc(p.cidade)}</td>
            <td>${p.valorVenda ? "R$ " + fmt(p.valorVenda) : ""}${p.valorVenda && p.valorLocacao ? " / " : ""}${p.valorLocacao ? "R$ " + fmt(p.valorLocacao) + "/mês" : ""}</td>
            <td><div class="thumb-list">${(p.imagens || []).slice(0, 4).map((i) => `<img src="${i}" alt="" />`).join("")}</div></td>
            <td>
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
    el.addEventListener("change", loadProperties);
    el.addEventListener("input", loadProperties);
  });
})();
