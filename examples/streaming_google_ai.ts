import "dotenv/config";
import { ChatMiddleware } from "../src/middleware/chat";

const chat = new ChatMiddleware({
  provider: "google-ai",
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.0-flash",
  },
});

process.stdout.write("\n=== STREAMING ===\n");

await chat.stream(
  [{ role: "user", content: "Explain embeddings in one paragraph" }],
  {
    onToken: (token) => process.stdout.write(token),
    onDone: (_final, metadata) => console.log("\n\n[done]", metadata),
    onError: (error) => console.log("\n\nStream [error]", error),
  },
  {
    temperature: 0.2,
  }
);

console.log("\n=== END ===\n");
