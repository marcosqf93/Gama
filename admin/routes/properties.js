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

router.post("/upload", auth, upload.array("imagens", 10), async (req, res) => {
  try {
    const urls = req.files.map((f) => f.path);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: "Erro no upload das imagens." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, tipo, finalidade, cidade, ref } = req.query;
    const filter = {};
    if (ref) {
      const normalizedRef = String(ref).trim();
      const strippedRef = normalizedRef.replace(/^0+(\d+)$/, "$1");
      filter.$or = [{ referencia: normalizedRef }];
      if (strippedRef !== normalizedRef) filter.$or.push({ referencia: strippedRef });
    }
    if (tipo) filter.tipo = tipo;
    if (finalidade) filter.finalidade = finalidade;
    if (cidade) filter.cidade = { $regex: cidade, $options: "i" };
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / limit) });
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
