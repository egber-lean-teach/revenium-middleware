import { GoogleAiClient, VertexAIClient } from "../clients";
import {
  IChatInit,
  IEmbeddingsOptions,
  IEmbeddingsResponse,
  Provider,
} from "../types";

export class EmbeddingsMiddleware {
  private provider: Provider;
  private google?: GoogleAiClient;
  private vertex?: VertexAIClient;

  constructor(init: IChatInit) {
    this.provider = init.provider;
    if (init.provider === "google-ai") {
      this.google = new GoogleAiClient(
        init.google?.apiKey,
        init.google?.model ?? "text-embedding-004"
      );
    } else {
      this.vertex = new VertexAIClient({
        ...init.vertex,
        model: init.vertex?.model ?? "text-embedding-004",
      });
    }
  }

  async embed(
    input: string[] | string,
    options: IEmbeddingsOptions = {}
  ): Promise<IEmbeddingsResponse> {
    if (this.provider === "google-ai" && this.google)
      return this.google.embeddings(input, options);
    if (this.provider === "vertex-ai" && this.vertex)
      return this.vertex.embeddings(input, options);
    throw new Error("Invalid provider initialization");
  }
}
