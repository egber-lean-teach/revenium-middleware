import { GenerativeModel } from "@google/generative-ai";
import { IChatMessage, IChatOptions, IChatResponse } from "../types/chat";
import { IEmbeddingsOptions, IEmbeddingsResponse } from "../types/embeddings";
import { AIClient } from "../types/googleAI";
import { IMapMessages } from "../types/mapMessages";
import { IMetadataRecord } from "../types/metadataRecord";
import { makeChatUsage, makeUsage } from "../middleware/tokens";
import { ITokenUsage } from "../types/tokenUsage";
import { finishMetadata } from "../middleware/metadata";
import { IStreamCallbacks } from "../types/streamCallbacks";

export abstract class BaseAIClient implements AIClient {
  protected modelName: string;

  constructor(modelName: string = "gemini-1.5-pro") {
    this.modelName = modelName;
  }

  protected mapMessages(messages: IChatMessage[]): IMapMessages[] {
    return messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }));
  }

  protected abstract getModel(options: IChatOptions | IEmbeddingsOptions): {
    model: any;
    meta: IMetadataRecord;
  };

  protected abstract extractText(response: any): string | undefined;
  protected abstract extractStreamToken(chunk: any): string | undefined;
  protected abstract embedItem(model: any, item: string): Promise<number[]>;

  public async chat(
    messages: IChatMessage[],
    options: IChatOptions = {}
  ): Promise<IChatResponse> {
    const { model, meta } = this.getModel(options);
    const res = await model.generateContent({
      contents: this.mapMessages(messages),
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens,
        temperature: options.temperature,
        topP: options.topP,
        topK: options.topK,
        stopSequences: options.stopSequences,
      },
    });
    const text = this.extractText(res);
    if (!text) throw new Error("Failed to extract text from response");
    const usage: ITokenUsage = makeChatUsage(messages, text);
    return {
      text,
      metadata: finishMetadata(meta, usage),
    };
  }

  public async stream(
    messages: IChatMessage[],
    callbacks: IStreamCallbacks,
    options: IChatOptions = {}
  ): Promise<string> {
    const { model, meta } = this.getModel(options);
    const stream = await model.generateContentStream({
      contents: this.mapMessages(messages),
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens,
        temperature: options.temperature,
        topP: options.topP,
        topK: options.topK,
        stopSequences: options.stopSequences,
      },
    });

    let finalText: string = "";
    for await (const chunk of stream.stream) {
      const token = this.extractStreamToken(chunk);
      if (token) {
        finalText += token;
        callbacks.onToken?.(token);
      }
    }
    const usage: ITokenUsage = makeChatUsage(messages, finalText);
    callbacks?.onDone?.(finalText, finishMetadata(meta, usage));
    return finalText;
  }

  public async embeddings(
    input: string[] | string,
    opts: IEmbeddingsOptions = {}
  ): Promise<IEmbeddingsResponse> {
    const { model, meta } = this.getModel(opts);
    const inputs: string[] = Array.isArray(input) ? input : [input];
    const vectors: number[][] = [];

    for (const item of inputs) {
      const embedding = await this.embedItem(model, item);
      vectors.push(embedding);
    }
    const usage: ITokenUsage = makeUsage(inputs.join("\n"), "");
    return {
      model: this.modelName,
      embeddings: vectors,
      metadata: finishMetadata(meta, usage),
    };
  }
}
