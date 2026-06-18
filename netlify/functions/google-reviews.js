const https = require("https");

const API_KEY = process.env.GOOGLE_PLACES_KEY || "";
const PLACE_ID = process.env.GOOGLE_PLACE_ID || "";
const SEARCH_NAME = "Imobiliária Geraldo Gama";
const SEARCH_ADDRESS = "Aquidauana MS";

const FALLBACK_REVIEWS = [];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error("Parse error")); }
      });
    }).on("error", reject);
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!API_KEY) {
    return {
      statusCode: 200,
      body: JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "fallback" })
    };
  }

  try {
    let placeId = PLACE_ID;

    if (!placeId) {
      const query = encodeURIComponent(`${SEARCH_NAME} ${SEARCH_ADDRESS}`);
      const search = await fetchJson(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`
      );
      if (search.status === "OK" && search.results.length) {
        placeId = search.results[0].place_id;
      }
    }

    if (!placeId) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "fallback" })
      };
    }

    const details = await fetchJson(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&language=pt-BR&key=${API_KEY}`
    );

    if (details.status === "OK" && details.result && details.result.reviews) {
      const reviews = details.result.reviews.map((r) => ({
        rating: r.rating,
        text: r.text,
        author: r.author_name,
        relative_time: r.relative_time_description
      }));
      return {
        statusCode: 200,
        headers: { "Cache-Control": "public, max-age=3600" },
        body: JSON.stringify({
          reviews,
          rating: details.result.rating,
          total: details.result.user_ratings_total,
          source: "google",
          place_id: placeId
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "fallback" })
    };
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({ reviews: FALLBACK_REVIEWS, source: "fallback" })
    };
  }
};
