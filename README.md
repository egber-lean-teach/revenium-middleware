## Revenium middleware

```md
const { text, metadata } = await chat.chat([
{ role: 'system', content: 'Eres útil' },
{ role: 'user', content: 'Hola' }
]);
```

## Uso rápido (Vertex AI)

```ts
import { ChatMiddleware } from "revenium-middleware-google-node";

const chat = new ChatMiddleware({ provider: "vertex-ai" });
const { text, metadata } = await chat.chat([
  { role: "user", content: "Hola desde Vertex" },
]);
```

## Streaming

```ts
await chat.stream(messages, {
  onToken: (t) => process.stdout.write(t),
  onDone: (final, meta) => console.log("\nDONE", meta),
});
```

## Embeddings

- Google AI: soporte **básico**; depende de la versión del SDK (puede no estar expuesto). Usa `text-embedding-004`.
- Vertex AI: soporte **completo** con `text-embedding-004`.

```ts
import { EmbeddingsMiddleware } from "revenium-middleware-google-node";

const emb = new EmbeddingsMiddleware({ provider: "vertex-ai" });
const res = await emb.embed(["hola mundo"]);
console.log(res.embeddings[0].length);
```

## Métricas y Metadata

Cada llamada devuelve `metadata` con `requestId`, `latencyMs` y `tokenUsage` (estimado). Para contabilidad exacta, utiliza datos de facturación de GCP.

## Ejemplos

```bash
npm run build
node --env-file=.env examples/chat_google_ai.mjs
node --env-file=.env examples/chat_vertex_ai.mjs
node --env-file=.env examples/streaming_google_ai.mjs
node --env-file=.env examples/streaming_vertex_ai.mjs
node --env-file=.env examples/embeddings_vertex_ai.mjs
```

## Notas de paridad con Python

- Se mantienen las mismas features; difiere el conteo de tokens (estimado en Node). Si necesitas equivalencia 1:1, reemplaza `tokens.ts` por un tokenizer específico del modelo.
- La API de `embedContent` puede variar entre versiones. Si tu SDK no lo expone para Google AI, el ejemplo lanza un error orientativo y recomienda usar Vertex para embeddings.

## Licencia

Apache-2.0
