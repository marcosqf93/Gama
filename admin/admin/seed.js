require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("./models/Property");

const IMOVEIS = [
  { referencia: "86", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Manoel Antônio Paes de Barros 2008 Guanandy", dormitorios: 2, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 1.300,00", imagem: "https://geraldogamaimv.com.br/fotos/17602.jpg" },
  { referencia: "87", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Delfino Alves Corrêa nº 250 Alto", dormitorios: 3, vagas: 1, area: "", venda: "R$ 290.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16914.jpg" },
  { referencia: "92", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Manoel Ant. Paes de Barros 1096 Centro", dormitorios: 0, vagas: 0, area: "", venda: "R$ 480.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/7162.jpg" },
  { referencia: "104", tipo: "Kitnet", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua Assis Ribeiro 1228 Apt 02 Bairro Alto", dormitorios: 1, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 450,00", imagem: "https://geraldogamaimv.com.br/fotos/17455.jpg" },
  { referencia: "125", tipo: "Sobrado", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Santa Terezinha Abdala Maksoud 10", dormitorios: 2, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 1.200,00", imagem: "https://geraldogamaimv.com.br/fotos/16448.jpg" },
  { referencia: "131", tipo: "Loja", finalidade: "venda", cidade: "Anastácio", endereco: "Rua João Leite Ribeiro 1099 Centro", dormitorios: 0, vagas: 0, area: "", venda: "R$ 300.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/14750.jpg" },
  { referencia: "160", tipo: "Kitnet", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Travessa Concórdia nº 3 Apt. 6 Serraria", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 550,00", imagem: "https://geraldogamaimv.com.br/fotos/15008.jpg" },
  { referencia: "178", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Pedro Pace 2207 Casa 3 Vila Iza", dormitorios: 2, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 800,00", imagem: "https://geraldogamaimv.com.br/fotos/17325.jpg" },
  { referencia: "182", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Carlos Ferreira Bandeira 1542 Santa Terezinha", dormitorios: 2, vagas: 1, area: "", venda: "R$ 295.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/15129.jpg" },
  { referencia: "233", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Antônio João Esq. com Ferroviários Alto", dormitorios: 0, vagas: 1, area: "", venda: "R$ 350.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/7427.jpg" },
  { referencia: "260", tipo: "Loja", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua Duque de Caxias Bairro Alto nº 1521", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 2.000,00", imagem: "https://geraldogamaimv.com.br/fotos/9847.jpg" },
  { referencia: "292", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Rua Aziz Scaff 767", dormitorios: 3, vagas: 1, area: "", venda: "R$ 450.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16484.jpg" },
  { referencia: "293", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Estevão Alves Corrêa ao lado da Madepauli", dormitorios: 0, vagas: 0, area: "345 m2", venda: "R$ 90.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/1660.jpg" },
  { referencia: "301", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Um nº 23 Vila Bancária", dormitorios: 2, vagas: 1, area: "", venda: "R$ 250.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/1770.jpg" },
  { referencia: "334", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Raimundo Damasceno 177", dormitorios: 1, vagas: 1, area: "150 m2", venda: "R$ 330.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16084.jpg" },
  { referencia: "362", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Travessa Ragalzi 826 Centro", dormitorios: 4, vagas: 3, area: "307 m2", venda: "R$ 480.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/3892.jpg" },
  { referencia: "371", tipo: "Imovel Comercial", finalidade: "venda", cidade: "Anastácio", endereco: "Rua João Leite Ribeiro 1125", dormitorios: 0, vagas: 1, area: "", venda: "R$ 400.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/12806.jpg" },
  { referencia: "399", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Av. Manoel Murtinho 727 Centro", dormitorios: 0, vagas: 0, area: "190 m2", venda: "R$ 550.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/5286.jpg" },
  { referencia: "424", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua dos Ferroviários 1342 Bairro Alto", dormitorios: 2, vagas: 1, area: "", venda: "R$ 330.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/6191.jpg" },
  { referencia: "425", tipo: "Terreno", finalidade: "venda", cidade: "Anastácio", endereco: "Rua Bom Fim", dormitorios: 0, vagas: 0, area: "450 m2", venda: "R$ 40.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/6214.jpg" },
  { referencia: "430", tipo: "Loja", finalidade: "venda", cidade: "Anastácio", endereco: "Av. Manoel Murtinho 426 Centro", dormitorios: 0, vagas: 0, area: "", venda: "R$ 300.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/15102.jpg" },
  { referencia: "433", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Daniel Guerra S/N Vila Icaraí", dormitorios: 0, vagas: 0, area: "575,2 m2", venda: "R$ 45.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/6474.jpg" },
  { referencia: "439", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Serraria Rua Roberto Scaff", dormitorios: 0, vagas: 0, area: "687,5 m2", venda: "R$ 125.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/6647.jpg" },
  { referencia: "477", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Av. Manoel Murtinho 189", dormitorios: 2, vagas: 1, area: "144 m2", venda: "R$ 400.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/9724.jpg" },
  { referencia: "478", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Carlito Leite S/N", dormitorios: 0, vagas: 0, area: "334,82 m2", venda: "R$ 50.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/8042.jpg" },
  { referencia: "485", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Duque de Caxias 3535 com Cecília Maria de Arruda", dormitorios: 0, vagas: 0, area: "", venda: "R$ 290.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/8113.jpg" },
  { referencia: "493", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Bichara Salamene", dormitorios: 0, vagas: 0, area: "6624 m2", venda: "R$ 400.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/8296.jpg" },
  { referencia: "518", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Antônio Graça, Nova Aquidauana", dormitorios: 0, vagas: 0, area: "540 m2", venda: "R$ 110.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/9207.jpg" },
  { referencia: "519", tipo: "Terreno", finalidade: "venda", cidade: "Anastácio", endereco: "Moisés Flores Nogueira", dormitorios: 0, vagas: 0, area: "300 m2", venda: "R$ 110.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/9217.jpg" },
  { referencia: "525", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Expedicionário Cândido Gomes 1275 Centro", dormitorios: 0, vagas: 0, area: "200 m2", venda: "R$ 300.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/9364.jpg" },
  { referencia: "539", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Lineu Augusto dos Reis Proença 234", dormitorios: 0, vagas: 0, area: "68,9 m2", venda: "R$ 220.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/9883.jpg" },
  { referencia: "540", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Fernando Lucarelli", dormitorios: 0, vagas: 0, area: "375 m2", venda: "R$ 70.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/9917.jpg" },
  { referencia: "558", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Estevão Alves Corrêa 392 Centro", dormitorios: 3, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.200,00", imagem: "https://geraldogamaimv.com.br/fotos/10447.jpg" },
  { referencia: "584", tipo: "Sala Comercial", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Francisco de Castro, 444, Sala 03, Guanandy", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.150,00", imagem: "https://geraldogamaimv.com.br/fotos/10631.jpg" },
  { referencia: "585", tipo: "Sala Comercial", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Francisco de Castro, 444, Sala 01, Guanandy", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.350,00", imagem: "https://geraldogamaimv.com.br/fotos/10655.jpg" },
  { referencia: "588", tipo: "Sala Comercial", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Francisco de Castro, 444, Sala 05, Guanandy", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.250,00", imagem: "https://geraldogamaimv.com.br/fotos/10709.jpg" },
  { referencia: "593", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "José Alves Ribeiro, Casa Marfim Vila Paraíso", dormitorios: 1, vagas: 0, area: "80 m2", venda: "R$ 0,00", locacao: "R$ 1.300,00", imagem: "https://geraldogamaimv.com.br/fotos/17370.jpg" },
  { referencia: "601", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Honório Simões Pires S/N Cidade Nova", dormitorios: 2, vagas: 1, area: "", venda: "R$ 220.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/11192.jpg" },
  { referencia: "616", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Nilza Ferraz Ribeiro 1234, Centro", dormitorios: 2, vagas: 1, area: "227,5 m2", venda: "R$ 800.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/11780.jpg" },
  { referencia: "617", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Av. Dr. Sabino (Pantaneta) 585", dormitorios: 3, vagas: 1, area: "128,25 m2", venda: "R$ 350.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/11793.jpg" },
  { referencia: "621", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Índio Neco 2413 Centro", dormitorios: 3, vagas: 0, area: "", venda: "R$ 120.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/11949.jpg" },
  { referencia: "623", tipo: "Apartamento", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Estevão Alves Corrêa 1000 Alto", dormitorios: 2, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 2.000,00", imagem: "https://geraldogamaimv.com.br/fotos/12024.jpg" },
  { referencia: "630", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua 01 Esquina com a Rua 08 Vila Bancária", dormitorios: 0, vagas: 0, area: "10567,2 m2", venda: "R$ 500.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/12296.jpg" },
  { referencia: "633", tipo: "Sobrado", finalidade: "venda", cidade: "Aquidauana", endereco: "Pandiá Calógeras 1036", dormitorios: 2, vagas: 1, area: "253,87 m2", venda: "R$ 1.500.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/12429.jpg" },
  { referencia: "641", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "João Pessoa 1033", dormitorios: 0, vagas: 1, area: "294,66 m2", venda: "R$ 980.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/12702.jpg" },
  { referencia: "652", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Manoel Antônio Paes de Barros", dormitorios: 0, vagas: 0, area: "", venda: "R$ 2.500.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/13110.jpg" },
  { referencia: "667", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua José Múcio Teixeira Esquina com José Rodrigue", dormitorios: 0, vagas: 0, area: "1397,25 m2", venda: "R$ 200.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/13522.jpg" },
  { referencia: "668", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Pedro Pace S/N", dormitorios: 0, vagas: 0, area: "110 m2", venda: "R$ 180.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/13523.jpg" },
  { referencia: "669", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua José Múcio Teixeira S/N", dormitorios: 0, vagas: 0, area: "502,7 m2", venda: "R$ 50.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/13524.jpg" },
  { referencia: "673", tipo: "Terreno", finalidade: "venda", cidade: "Anastácio", endereco: "Ben Te Vi", dormitorios: 0, vagas: 0, area: "503,12 m2", venda: "R$ 45.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/13599.jpg" },
  { referencia: "680", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "7 de Setembro 1955 Guanandy", dormitorios: 2, vagas: 1, area: "120 m2", venda: "R$ 250.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/13871.jpg" },
  { referencia: "681", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Marechal Mallet 306 Centro", dormitorios: 3, vagas: 1, area: "123 m2", venda: "R$ 280.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/14006.jpg" },
  { referencia: "682", tipo: "Casa", finalidade: "ambos", cidade: "Aquidauana", endereco: "Cândido Mariano 544, Centro", dormitorios: 1, vagas: 1, area: "", venda: "R$ 400.000,00", locacao: "R$ 2.000,00", imagem: "https://geraldogamaimv.com.br/fotos/14048.jpg" },
  { referencia: "685", tipo: "Imovel Comercial", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Estevão Alves Corrêa 1890 Bairro Alto", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 10.000,00", imagem: "https://geraldogamaimv.com.br/fotos/14150.jpg" },
  { referencia: "686", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Dos Ferroviários 2850 Bairro Cidade Nova", dormitorios: 2, vagas: 1, area: "128 m2", venda: "R$ 250.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/14229.jpg" },
  { referencia: "690", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Hélio Galan Fernandes 372 Serraria", dormitorios: 2, vagas: 1, area: "120 m2", venda: "R$ 280.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/14382.jpg" },
  { referencia: "697", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Nilza Ferraz Ribeiro 454 Cidade Nova", dormitorios: 2, vagas: 1, area: "430 m2", venda: "R$ 650.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/14499.jpg" },
  { referencia: "701", tipo: "Loja", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua 13 de Junho, Apartamento, Lote 02", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.000,00", imagem: "https://geraldogamaimv.com.br/fotos/14625.jpg" },
  { referencia: "724", tipo: "Chacara", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Antônio Alves Corrêa Região do Morrinho", dormitorios: 2, vagas: 0, area: "", venda: "R$ 460.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/15215.jpg" },
  { referencia: "726", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua Duque de Caxias - 2362, Bairro Alto", dormitorios: 1, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 1.600,00", imagem: "https://geraldogamaimv.com.br/fotos/17401.jpg" },
  { referencia: "735", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Carlito Leite 4 Nova Terezinha", dormitorios: 1, vagas: 1, area: "", venda: "R$ 140.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/15731.jpg" },
  { referencia: "736", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Luiz Pinto Quadra 132 Lote 15 Nova Aquidauana", dormitorios: 0, vagas: 0, area: "540 m2", venda: "R$ 30.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/15769.jpg" },
  { referencia: "746", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Assis Ribeiro 1053 Bairro Alto", dormitorios: 0, vagas: 0, area: "109,2 m2", venda: "R$ 330.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16297.jpg" },
  { referencia: "756", tipo: "Loja", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Bichara Salamene Centro", dormitorios: 0, vagas: 0, area: "131 m2", venda: "R$ 0,00", locacao: "R$ 3.300,00", imagem: "https://geraldogamaimv.com.br/fotos/16708.jpg" },
  { referencia: "757", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua José Duarte Bairro São Pedro", dormitorios: 0, vagas: 0, area: "625 m2", venda: "R$ 110.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16720.jpg" },
  { referencia: "758", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Castelo Branco Esq. Rua Pandiá Calógeras Vila Paraíso", dormitorios: 0, vagas: 0, area: "650 m2", venda: "R$ 100.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16729.jpg" },
  { referencia: "760", tipo: "Casa", finalidade: "venda", cidade: "Anastácio", endereco: "Avenida JK nº 1222", dormitorios: 0, vagas: 0, area: "198 m2", venda: "R$ 390.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16765.jpg" },
  { referencia: "761", tipo: "Sitio", finalidade: "venda", cidade: "Aquidauana", endereco: "Pesqueiro Colônia Buriti", dormitorios: 0, vagas: 0, area: "", venda: "R$ 450.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16777.jpg" },
  { referencia: "762", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Joaquim Alves Ribeiro 3412", dormitorios: 0, vagas: 0, area: "", venda: "R$ 170.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16804.jpg" },
  { referencia: "763", tipo: "Casa de Condominio", finalidade: "aluguel", cidade: "Anastácio", endereco: "Av. Juscelino Kubitschek Casa B", dormitorios: 2, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 1.300,00", imagem: "https://geraldogamaimv.com.br/fotos/16846.jpg" },
  { referencia: "764", tipo: "Casa", finalidade: "aluguel", cidade: "Anastácio", endereco: "Avenida Juscelino Kubitschek Casa C", dormitorios: 3, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 2.000,00", imagem: "https://geraldogamaimv.com.br/fotos/16830.jpg" },
  { referencia: "765", tipo: "Casa", finalidade: "aluguel", cidade: "Anastácio", endereco: "Avenida Juscelino Kubitschek Casa D", dormitorios: 2, vagas: 1, area: "", venda: "R$ 0,00", locacao: "R$ 1.300,00", imagem: "https://geraldogamaimv.com.br/fotos/16817.jpg" },
  { referencia: "766", tipo: "Terreno", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua 27 de Julho Próx. Avenida Integração", dormitorios: 0, vagas: 0, area: "1608 m2", venda: "R$ 280.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16862.jpg" },
  { referencia: "768", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Rua Pandiá Calógeras", dormitorios: 0, vagas: 0, area: "", venda: "R$ 220.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/16867.jpg" },
  { referencia: "771", tipo: "Terreno", finalidade: "venda", cidade: "Anastácio", endereco: "Rua 27 de Julho Centro", dormitorios: 0, vagas: 0, area: "688 m2", venda: "R$ 250.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/17020.jpg" },
  { referencia: "774", tipo: "Casa", finalidade: "venda", cidade: "Aquidauana", endereco: "Travessa Ceará 231, Próximo Portal Atacado", dormitorios: 0, vagas: 0, area: "", venda: "R$ 170.000,00", locacao: "R$ 0,00", imagem: "https://geraldogamaimv.com.br/fotos/17215.jpg" },
  { referencia: "776", tipo: "Kitnet", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Avenida Pantaneta 668", dormitorios: 1, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.250,00", imagem: "https://geraldogamaimv.com.br/fotos/17260.jpg" },
  { referencia: "778", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua Amélia Arima, 765", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 800,00", imagem: "https://geraldogamaimv.com.br/fotos/17291.jpg" },
  { referencia: "781", tipo: "Loja", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Avenida Pantaneta 668, Salão A (Esquerda), Bairro Alto", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.600,00", imagem: "https://geraldogamaimv.com.br/fotos/17464.jpg" },
  { referencia: "783", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua Rodrigo Peixoto 115 Bairro Alto", dormitorios: 2, vagas: 2, area: "249,5 m2", venda: "R$ 0,00", locacao: "R$ 2.950,00", imagem: "https://geraldogamaimv.com.br/fotos/17517.jpg" },
  { referencia: "784", tipo: "Casa", finalidade: "aluguel", cidade: "Aquidauana", endereco: "Rua Tenente Egídio Vital - 378, Vila Pinheiro", dormitorios: 0, vagas: 0, area: "", venda: "R$ 0,00", locacao: "R$ 1.200,00", imagem: "https://geraldogamaimv.com.br/fotos/17556.jpg" },
];

function parseValor(str) {
  if (!str) return 0;
  const cleaned = str.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  await Property.deleteMany({});
  console.log("Cleared existing properties");

  const docs = IMOVEIS.map((p) => ({
    referencia: p.referencia,
    tipo: p.tipo,
    finalidade: p.finalidade,
    cidade: p.cidade,
    bairro: "",
    endereco: p.endereco,
    dormitorios: typeof p.dormitorios === "string" ? 0 : p.dormitorios,
    vagas: typeof p.vagas === "string" ? 0 : p.vagas,
    metragem: parseFloat(p.area.replace(" m2", "").replace(",", ".")) || 0,
    valorVenda: parseValor(p.venda),
    valorLocacao: parseValor(p.locacao),
    imagens: [p.imagem],
    descricao: "",
    ativo: true,
  }));

  await Property.insertMany(docs);
  console.log(`Seeded ${docs.length} properties`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
