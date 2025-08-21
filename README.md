# Middleware for Google AI (Node.js)

This repository provides a **Node.js middleware** that integrates with **Google AI (Gemini / Vertex AI)**.  
It offers an easy and modular way to use **chat-based interactions**, **embeddings generation**, and **streaming responses** inside your Node.js applications.

---

## ✨ Features

- **Chat Middleware** – Handle chat messages with Google AI models.
- **Embeddings Generator** – Create embeddings for semantic search, similarity, and clustering tasks.
- **Streaming Responses** – Stream model outputs in real time instead of waiting for a full response.
- **Configurable Environment** – Supports `.env` for managing API keys and project configuration.
- **TypeScript Ready** – Fully typed for better developer experience.

---

## 📦 Installation

```bash
git clone https://github.com/your-org/middleware-node-js.git
cd middleware-node-js
npm install
```

Or add it directly to your project:

```bash
npm install your-middleware-package
```

---

## ⚙️ Environment Setup

Create a `.env` file based on the provided `.env.example`:

```env
GOOGLE_API_KEY=your-google-api-key
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
```

---

## 🚀 Usage

### 1. Chat Middleware

```ts
import { chatMiddleware } from "./examples/chat_middleware_google";

async function run() {
  const response = await chatMiddleware("Hello, how are you?");
  console.log(response);
}

run();
```

### 2. Embeddings

```ts
import { generateEmbeddings } from "./examples/embeddings_google_ai";

async function run() {
  const embeddings = await generateEmbeddings(
    "Artificial intelligence is awesome"
  );
  console.log(embeddings);
}

run();
```

### 3. Streaming Responses

```ts
import { streamResponse } from "./examples/streaming_google_ai";

async function run() {
  await streamResponse("Tell me a story about space exploration");
}

run();
```

---

## 📖 Scripts

- `npm run build` → Compile TypeScript
- `npm run embeddings:google` → Show embeddings google AI example.
- `npm run chat:google` → Show chat google AI example.
- `npm run streaming:google` → Show streaming google AI example.

---

## 🛠️ Tech Stack

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)

---

## 📌 Notes

- Requires a valid **Google API Key**.
- Designed to work with **Vertex AI / Gemini models**.
- Can be extended to support additional providers in the future.

---
