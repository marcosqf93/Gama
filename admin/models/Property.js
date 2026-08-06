const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    tipo: { type: String, required: true, trim: true },
    finalidade: { type: String, required: true, enum: ["venda", "aluguel", "ambos"] },
    cidade: { type: String, required: true, trim: true },
    bairro: { type: String, default: "", trim: true },
    endereco: { type: String, default: "", trim: true },
    referencia: { type: String, default: "", trim: true },
    dormitorios: { type: Number, default: 0 },
    suites: { type: Number, default: 0 },
    salas: { type: Number, default: 0 },
    cozinhas: { type: Number, default: 0 },
    banheiros: { type: Number, default: 0 },
    varandas: { type: Boolean, default: false },
    garagens: { type: Number, default: 0 },
    areaGourmet: { type: Boolean, default: false },
    areaServico: { type: Number, default: 0 },
    copa: { type: Number, default: 0 },
    metragem: { type: Number, default: 0 },
    mapaUrl: { type: String, default: "", trim: true },
    valorVenda: { type: Number, default: 0 },
    valorLocacao: { type: Number, default: 0 },
    descricao: { type: String, default: "", trim: true },
    piscina: { type: Boolean, default: false },
    churrasqueira: { type: Boolean, default: false },
    quintal: { type: Boolean, default: false },
    jardim: { type: Boolean, default: false },
    edicula: { type: Boolean, default: false },
    lavanderia: { type: Boolean, default: false },
    closet: { type: Boolean, default: false },
    escritorio: { type: Boolean, default: false },
    moveisPlanejados: { type: Boolean, default: false },
    imovelMobiliado: { type: Boolean, default: false },
    arCondicionado: { type: Boolean, default: false },
    energiaSolar: { type: Boolean, default: false },
    garagemCoberta: { type: Boolean, default: false },
    portaoEletronico: { type: Boolean, default: false },
    cercaEletrica: { type: Boolean, default: false },
    acessibilidade: { type: Boolean, default: false },
    aceitaFinanciamento: { type: Boolean, default: false },
    aceitaFGTS: { type: Boolean, default: false },
    aceitaProposta: { type: Boolean, default: false },
    aceitaPermuta: { type: Boolean, default: false },
    aceitaVeiculo: { type: Boolean, default: false },
    documentacaoRegular: { type: Boolean, default: false },
    escriturado: { type: Boolean, default: false },
    imagens: [{ type: String }],
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ tipo: 1, finalidade: 1, cidade: 1 });
propertySchema.index({ referencia: "text", bairro: "text", endereco: "text" });

module.exports = mongoose.model("Property", propertySchema);
