import "dotenv/config";
import { EmbeddingsMiddleware } from "../src/middleware/embeddings";

const embeddings = new EmbeddingsMiddleware({
  provider: "google-ai",
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
});

console.log("\n=== EMBEDDINGS ===\n");
try {
  const res = await embeddings.embed(
    [
      "A quick brown fox jumps over the lazy dog.",
      "Graph neural networks on molecular datasets.",
    ],
    { model: "text-embedding-004" }
  );
  console.log(
    "dims:",
    res.embeddings[0]?.length,
    "count:",
    res.embeddings.length
  );
  console.log("metadata:", res.metadata);
  console.log("embeddings:", res.embeddings);
} catch (e) {
  console.error(
    "Google AI embeddings (basic) not available on this SDK/version:",
    e.message
  );
}

console.log("\n=== END ===\n");
