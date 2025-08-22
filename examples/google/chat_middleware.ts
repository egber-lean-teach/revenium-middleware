import "dotenv/config";
import { ChatMiddleware } from "../../src/middleware/chat";

const chat = new ChatMiddleware({
  provider: "google-ai",
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.0-flash",
  },
});

const response = await chat.chat([{ role: "user", content: "What is JS" }]);
console.log("Answer: ", response.text);
