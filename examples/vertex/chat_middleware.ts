import { ChatMiddleware } from "../../src/middleware/chat";

console.log("=== Vertex Chat Middleware ===");

const run = async () => {
  const chatVertex = new ChatMiddleware({
    provider: "vertex-ai",
    vertex: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION,
    },
  });
  try {
    const response = await chatVertex.chat([
      { role: "user", content: "What is JS" },
    ]);
    console.log("Answer[vertex]: ", response.text);
    console.log("Metadata[vertex]: ", response.metadata);
  } catch (error) {
    console.error("Error[vertex]: ", error);
  }
};

await run();
console.log("\n=== END ===\n");
