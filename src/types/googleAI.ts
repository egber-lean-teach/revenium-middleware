import { IChatMessage, IChatOptions, IChatResponse } from "./chat";
import { IStreamCallbacks } from "./streamCallbacks";
import { IEmbeddingsOptions, IEmbeddingsResponse } from "./embeddings";

export interface AIClient {
  chat(messages: IChatMessage[], options: IChatOptions): Promise<IChatResponse>;
  stream(
    messages: IChatMessage[],
    callbacks: IStreamCallbacks,
    options: IChatOptions
  ): Promise<string>;
  embeddings(
    input: string[] | string,
    opts: IEmbeddingsOptions
  ): Promise<IEmbeddingsResponse>;
}
