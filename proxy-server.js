const http = require("http");
const https = require("https");
const url = require("url");

const PORT = 3001;
const API_KEY = process.env.GOOGLE_PLACES_KEY || "";
const PLACE_NAME = "Imobiliária Geraldo Gama";
const PLACE_ADDRESS = "Aquidauana MS";

const FALLBACK_REVIEWS = [
  { rating: 5, text: "Empresa séria e comprometida. Me ajudaram a comprar meu primeiro imóvel com total segurança e transparência. Recomendo de olhos fechados!", author: "Cliente Google" },
  { rating: 5, text: "Equipe atenciosa e muito profissional. Encontrei rapidamente um ponto comercial para minha empresa. Agilidade impressionante!", author: "Cliente Google" },
  { rating: 5, text: "Excelente atendimento e ótima localização do escritório. O corretor Geraldo é muito experiente e dedicado. Nota 10!", author: "Cliente Google" },
  { rating: 5, text: "Processo de locação rápido e sem burocracia. A imobiliária cuida de toda a documentação com eficiência. Super recomendo!", author: "Cliente Google" },
  { rating: 5, text: "Referência em Aquidauana. Já negociei três imóveis com eles e sempre tive uma experiência positiva. Confiança que se conquista com anos de trabalho.", author: "Cliente Google" }
];

function placesTextSearch(key, name, address) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${name} ${address}`);
    const path = `/maps/api/place/textsearch/json?query=${query}&key=${key}`;
    https.get({ hostname: "maps.googleapis.com", path }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status !== "OK" || !parsed.results.length) {
            return reject(new Error("No results"));
          }
          resolve(parsed.results[0].place_id);
        } catch {
          reject(new Error("Parse error"));
        }
      });
    }).on("error", reject);
  });
}

function placeDetails(key, placeId) {
  return new Promise((resolve, reject) => {
    const path = `/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${key}`;
    https.get({ hostname: "maps.googleapis.com", path }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Parse error"));
        }
      });
    }).on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const parsed = url.parse(req.url);
  if (parsed.pathname === "/api/reviews") {
    if (!API_KEY) {
      res.end(JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "static" }));
      return;
    }
    try {
      const placeId = await placesTextSearch(API_KEY, PLACE_NAME, PLACE_ADDRESS);
      const details = await placeDetails(API_KEY, placeId);
      if (details.result && details.result.reviews) {
        const reviews = details.result.reviews.map((r) => ({
          rating: r.rating,
          text: r.text,
          author: r.author_name
        }));
        res.end(JSON.stringify({ reviews, source: "google" }));
      } else {
        res.end(JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "static" }));
      }
    } catch {
      res.end(JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "static" }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  }
});

server.listen(PORT, () => {
  console.log("Proxy server running at http://localhost:" + PORT);
  if (!API_KEY) {
    console.log("No GOOGLE_PLACES_KEY set — using static fallback reviews.");
    console.log("To enable live reviews, set:");
    console.log('  $env:GOOGLE_PLACES_KEY="YOUR_API_KEY"');
    console.log("Get a key at https://console.cloud.google.com (enable Places API)");
  }
});
