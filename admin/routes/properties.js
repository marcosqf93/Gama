const cloudinary = require("cloudinary").v2;
const archiver = require("archiver");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const auth = require("../middleware/auth");
const Property = require("../models/Property");

const router = require("express").Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "geraldo-gama",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm", "ogv", "avi", "mkv"],
    transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
  },
});
const upload = multer({ storage });

function fileNameFromUrl(url, fallbackIndex) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || "";
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    const ext = match ? `.${match[1].toLowerCase()}` : "";
    const base = pathname.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "") || `midia-${fallbackIndex + 1}`;
    return `${String(base).replace(/[^a-z0-9-_]+/gi, "-")}${ext || ""}`;
  } catch {
    return `midia-${fallbackIndex + 1}`;
  }
}

async function appendUrlToZip(archive, url, name) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  archive.append(buffer, { name });
}

function normalizePropertyPayload(payload = {}) {
  const toBool = (value) => value === true || value === "true" || value === "on" || value === 1 || value === "1";
  return {
    ...payload,
    metragem: Number(payload.metragem) || 0,
    areaGourmet: toBool(payload.areaGourmet),
    varandas: toBool(payload.varandas),
    piscina: toBool(payload.piscina),
    churrasqueira: toBool(payload.churrasqueira),
    quintal: toBool(payload.quintal),
    jardim: toBool(payload.jardim),
    edicula: toBool(payload.edicula),
    lavanderia: toBool(payload.lavanderia),
    closet: toBool(payload.closet),
    escritorio: toBool(payload.escritorio),
    moveisPlanejados: toBool(payload.moveisPlanejados),
    imovelMobiliado: toBool(payload.imovelMobiliado),
    arCondicionado: toBool(payload.arCondicionado),
    energiaSolar: toBool(payload.energiaSolar),
    garagemCoberta: toBool(payload.garagemCoberta),
    portaoEletronico: toBool(payload.portaoEletronico),
    cercaEletrica: toBool(payload.cercaEletrica),
    acessibilidade: toBool(payload.acessibilidade),
    aceitaFinanciamento: toBool(payload.aceitaFinanciamento),
    aceitaFGTS: toBool(payload.aceitaFGTS),
    aceitaProposta: toBool(payload.aceitaProposta),
    aceitaPermuta: toBool(payload.aceitaPermuta),
    aceitaVeiculo: toBool(payload.aceitaVeiculo),
    documentacaoRegular: toBool(payload.documentacaoRegular),
    escriturado: toBool(payload.escriturado),
  };
}

router.post("/upload", auth, upload.array("imagens", 20), async (req, res) => {
  try {
    const urls = req.files.map((f) => f.path);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: "Erro no upload das mídias." });
  }
});

router.get("/:id/download-media", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Imóvel não encontrado." });

    const media = Array.isArray(property.imagens) ? property.imagens.filter(Boolean) : [];
    if (!media.length) return res.status(404).json({ error: "Este imóvel não possui mídias." });

    const archiveName = `imovel-${String(property.referencia || property._id).replace(/[^a-z0-9-_]+/gi, "-")}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${archiveName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      if (!res.headersSent) res.status(500);
      res.end();
    });
    archive.pipe(res);

    for (let i = 0; i < media.length; i++) {
      const url = media[i];
      const fileName = fileNameFromUrl(url, i);
      await appendUrlToZip(archive, url, fileName);
    }

    await archive.finalize();
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar download das mídias." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, tipo, finalidade, cidade, ref, q, ativo } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 50);
    const filter = {};
    if (q) {
      const query = String(q).trim();
      const normalizedQuery = query.replace(/^0+/, "") || query;
      const textRegex = { $regex: query, $options: "i" };
      filter.$or = [
        { referencia: query },
        { referencia: normalizedQuery },
        { bairro: textRegex },
        { endereco: textRegex },
        { cidade: textRegex },
        { tipo: textRegex },
      ];
    }
    if (ref) {
      const normalizedRef = String(ref).trim();
      const strippedRef = normalizedRef.replace(/^0+(\d+)$/, "$1");
      const refOr = [{ referencia: normalizedRef }];
      if (strippedRef !== normalizedRef) refOr.push({ referencia: strippedRef });
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: refOr });
    }
    if (tipo) filter.tipo = tipo;
    if (finalidade) filter.finalidade = finalidade;
    if (cidade) filter.cidade = { $regex: cidade, $options: "i" };
    if (ativo === "true") filter.ativo = true;
    if (ativo === "false") filter.ativo = false;
    const total = await Property.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limitNum));
    const currentPage = Math.min(pageNum, pages);
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limitNum)
      .limit(limitNum);
    res.json({ properties, total, page: currentPage, pages });
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar imóveis." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Imóvel não encontrado." });
    res.json({ property });
  } catch {
    res.status(500).json({ error: "Erro ao buscar imóvel." });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const property = await Property.create(normalizePropertyPayload(req.body));
    res.status(201).json({ property });
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar imóvel.", details: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, normalizePropertyPayload(req.body), {
      new: true,
      runValidators: true,
    });
    if (!property) return res.status(404).json({ error: "Imóvel não encontrado." });
    res.json({ property });
  } catch (err) {
    res.status(400).json({ error: "Erro ao atualizar imóvel.", details: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "Imóvel não encontrado." });
    res.json({ message: "Imóvel excluído com sucesso." });
  } catch {
    res.status(500).json({ error: "Erro ao excluir imóvel." });
  }
});

module.exports = router;
