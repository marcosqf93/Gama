const IMOVEIS_ENRICHMENT = {
  "86": { cidade: "Aquidauana", endereco: "Manoel Antônio Paes de Barros 2008 Guanandy", fotos: ["https://geraldogamaimv.com.br/fotos/17602.jpg"] },
  "685": { cidade: "Aquidauana", endereco: "Estevão Alves Corrêa 1890 Bairro Alto", fotos: ["https://geraldogamaimv.com.br/fotos/14150.jpg"] },
  "686": { cidade: "Aquidauana", endereco: "Dos Ferroviários 2850 Bairro Cidade Nova", fotos: ["https://geraldogamaimv.com.br/fotos/14229.jpg"] },
  "690": { cidade: "Aquidauana", endereco: "Hélio Galan Fernandes 372 Serraria", fotos: ["https://geraldogamaimv.com.br/fotos/14382.jpg"] },
  "697": { cidade: "Aquidauana", endereco: "Nilza Ferraz Ribeiro 454 Cidade Nova", fotos: ["https://geraldogamaimv.com.br/fotos/14499.jpg"] },
  "701": { cidade: "Aquidauana", endereco: "Rua 13 de Junho, Apartamento, Lote 02", fotos: ["https://geraldogamaimv.com.br/fotos/14625.jpg"] },
  "724": { cidade: "Aquidauana", endereco: "Rua Antônio Alves Corrêa Região do Morrinho", fotos: ["https://geraldogamaimv.com.br/fotos/15215.jpg"] },
  "726": { cidade: "Aquidauana", endereco: "Rua Duque de Caxias - 2362, Bairro Alto", fotos: ["https://geraldogamaimv.com.br/fotos/17401.jpg"] },
  "735": { cidade: "Aquidauana", endereco: "Carlito Leite 4 Nova Terezinha", fotos: ["https://geraldogamaimv.com.br/fotos/15731.jpg"] },
  "736": { cidade: "Aquidauana", endereco: "Luiz Pinto Quadra 132 Lote 15 Nova Aquidauana", fotos: ["https://geraldogamaimv.com.br/fotos/15769.jpg"] },
  "746": { cidade: "Aquidauana", endereco: "Rua Assis Ribeiro 1053 Bairro Alto", fotos: ["https://geraldogamaimv.com.br/fotos/16297.jpg"] },
  "756": { cidade: "Aquidauana", endereco: "Bichara Salamene Centro", fotos: ["https://geraldogamaimv.com.br/fotos/16708.jpg"] },
  "757": { cidade: "Aquidauana", endereco: "Rua José Duarte Bairro São Pedro", fotos: ["https://geraldogamaimv.com.br/fotos/16720.jpg"] },
  "758": { cidade: "Aquidauana", endereco: "Rua Castelo Branco Esq. Rua Pandiá Calógeras Vila Paraíso", fotos: ["https://geraldogamaimv.com.br/fotos/16729.jpg"] },
  "760": { cidade: "Anastácio", endereco: "Avenida JK nº 1222", fotos: ["https://geraldogamaimv.com.br/fotos/16765.jpg"] },
  "761": { cidade: "Aquidauana", endereco: "Pesqueiro Colônia Buriti", fotos: ["https://geraldogamaimv.com.br/fotos/16777.jpg"] },
  "762": { cidade: "Aquidauana", endereco: "Rua Joaquim Alves Ribeiro 3412", fotos: ["https://geraldogamaimv.com.br/fotos/16804.jpg"] },
  "763": { cidade: "Anastácio", endereco: "Av. Juscelino Kubitschek Casa B", fotos: ["https://geraldogamaimv.com.br/fotos/16846.jpg"] },
  "764": { cidade: "Anastácio", endereco: "Avenida Juscelino Kubitschek Casa C", fotos: ["https://geraldogamaimv.com.br/fotos/16830.jpg"] },
  "765": { cidade: "Anastácio", endereco: "Avenida Juscelino Kubitschek Casa D", fotos: ["https://geraldogamaimv.com.br/fotos/16817.jpg"] },
  "766": { cidade: "Aquidauana", endereco: "Rua 27 de Julho Próx. Avenida Integração", fotos: ["https://geraldogamaimv.com.br/fotos/16862.jpg"] },
  "768": { cidade: "Aquidauana", endereco: "Rua Pandiá Calógeras", fotos: ["https://geraldogamaimv.com.br/fotos/16867.jpg"] },
  "771": { cidade: "Anastácio", endereco: "Rua 27 de Julho Centro", fotos: ["https://geraldogamaimv.com.br/fotos/17020.jpg"] },
  "774": { cidade: "Aquidauana", endereco: "Travessa Ceará 231, Próximo Portal Atacado", fotos: ["https://geraldogamaimv.com.br/fotos/17215.jpg"] },
  "776": { cidade: "Aquidauana", endereco: "Avenida Pantaneta 668", fotos: ["https://geraldogamaimv.com.br/fotos/17260.jpg"] },
  "778": { cidade: "Aquidauana", endereco: "Rua Amélia Arima, 765", fotos: ["https://geraldogamaimv.com.br/fotos/17291.jpg"] },
  "781": { cidade: "Aquidauana", endereco: "Avenida Pantaneta 668, Salão A (Esquerda), Bairro Alto", fotos: ["https://geraldogamaimv.com.br/fotos/17464.jpg"] },
  "783": { cidade: "Aquidauana", endereco: "Rua Rodrigo Peixoto 115 Bairro Alto", fotos: ["https://geraldogamaimv.com.br/fotos/17517.jpg"] },
  "784": { cidade: "Aquidauana", endereco: "Rua Tenente Egídio Vital - 378, Vila Pinheiro", fotos: ["https://geraldogamaimv.com.br/fotos/17556.jpg"] }
};

function gerarSlug(tipo, endereco, cidade, ref) {
  const raw = `${tipo} ${endereco} ${cidade}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + ref;
}
