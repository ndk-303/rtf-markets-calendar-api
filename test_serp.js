const { getJson } = require("serpapi");

getJson({
  engine: "google_finance_markets",
  trend: "indexes",
  index_market: "americas",
  api_key: "e4675bcedde721ea75e9c8fcbc767c5a70d9e5bb1a903dbc79380f4a938b3de6"
}, (json) => {
  console.log(JSON.stringify(json, null, 2));
});
