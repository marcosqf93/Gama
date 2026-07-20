const cloudinary = require("cloudinary").v2;
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
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
  },
});
const upload = multer({ storage });

function normalizePropertyPayload(payload = {}) {
  return {
    ...payload,
    metragem: Number(payload.metragem) || 0,
  };
}

router.post("/upload", auth, upload.array("imagens", 20), async (req, res) => {
  try {
    const urls = req.files.map((f) => f.path);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: "Erro no upload das imagens." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, tipo, finalidade, cidade, ref, q } = req.query;
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
