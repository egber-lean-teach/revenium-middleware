import { GoogleAiClient, VertexAIClient } from "../clients";
import {
  IChatInit,
  IChatMessage,
  IChatOptions,
  IStreamCallbacks,
  Provider,
} from "../types";

export class ChatMiddleware {
  private provider: Provider;
  private google?: GoogleAiClient;
  private vertex?: VertexAIClient;

  constructor(init: IChatInit) {
    this.provider = init.provider;
    if (init.provider === "google-ai") {
      this.google = new GoogleAiClient(init.google?.apiKey, init.google?.model);
    } else {
      this.vertex = new VertexAIClient(init.vertex);
    }
  }

  public async chat(messages: IChatMessage[], options: IChatOptions = {}) {
    if (this.provider === "google-ai" && this.google)
      return this.google.chat(messages, options);
    if (this.provider === "vertex-ai" && this.vertex)
      return this.vertex.chat(messages, options);
    throw new Error("Invalid provider initialization");
  }

  public async stream(
    messages: IChatMessage[],
    callbacks: IStreamCallbacks,
    options: IChatOptions = {}
  ) {
    if (this.provider === "google-ai" && this.google)
      return this.google.stream(messages, callbacks, options);
    if (this.provider === "vertex-ai" && this.vertex)
      return this.vertex.stream(messages, callbacks, options);
    throw new Error("Invalid provider initialization");
  }
}
