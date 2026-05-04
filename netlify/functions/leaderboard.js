const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const store = getStore("leaderboard");
  const key = "top-scores";

  let scores = [];
  try {
    scores = (await store.get(key, { type: "json" })) || [];
  } catch {}

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    const name = String(body.name || "").trim().slice(0, 12);
    const score = Number(body.score || 0);

    if (name && Number.isFinite(score)) {
      const existing = scores.find((row) => row.name === name);
      if (existing) existing.score = Math.max(existing.score, score);
      else scores.push({ name, score });

      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 5);

      await store.setJSON(key, scores);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(scores)
  };
};
