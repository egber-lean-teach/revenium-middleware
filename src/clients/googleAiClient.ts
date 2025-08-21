import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { AIClient } from "../types/googleAI";
import { IMapMessages } from "../types/mapMessages";
import { IChatMessage } from "../types/chat";
import { IChatOptions } from "../types/chat";
import { IChatResponse } from "../types/chat";
import { startMetadata } from "../middleware/metadata";
import { finishMetadata } from "../middleware/metadata";
import { IMetadataRecord } from "../types/metadataRecord";
import { ITokenUsage } from "../types/tokenUsage";
import { makeChatUsage, makeUsage } from "../middleware/tokens";
import { IStreamCallbacks } from "../types/streamCallbacks";
import { IEmbeddingsOptions, IEmbeddingsResponse } from "../types/embeddings";

export class GoogleAiClient implements AIClient {
  private modelName: string;
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string, modelName: string = "gemini-1.5-pro") {
    const key = apiKey ?? process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GOOGLE_API_KEY is require for Google AI");
    this.genAI = new GoogleGenerativeAI(key);
    this.modelName = modelName;
  }

  private mapMessages(messages: IChatMessage[]): IMapMessages[] {
    return messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
  }

  public async chat(
    messages: IChatMessage[],
    options: IChatOptions
  ): Promise<IChatResponse> {
    const model: GenerativeModel = this.genAI.getGenerativeModel({
      model: options.model ?? this.modelName,
    });
    const meta: IMetadataRecord = startMetadata(
      "google-ai",
      options.model ?? this.modelName,
      options.metadata
    );
    try {
      const gen = await model.generateContent({
        contents: this.mapMessages(messages),
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens,
          temperature: options.temperature,
          topK: options.topK,
          topP: options.topP,
          stopSequences: options.stopSequences,
        },
      });
      const text = gen.response.text();
      if (!text) throw new Error("Failed to generate content");
      const usage: ITokenUsage = makeChatUsage(messages, text);
      return {
        text,
        metadata: finishMetadata(meta, usage),
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  public async stream(
    messages: IChatMessage[],
    callbacks: IStreamCallbacks,
    options: IChatOptions = {}
  ): Promise<string> {
    const model: GenerativeModel = this.genAI.getGenerativeModel({
      model: options.model ?? this.modelName,
    });
    const meta: IMetadataRecord = startMetadata(
      "google-ai",
      options.model ?? this.modelName,
      options.metadata
    );

    try {
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
        const part = chunk.text();
        if (part) {
          finalText += part;
          callbacks.onToken?.(part);
        }
      }
      const usage: ITokenUsage = makeChatUsage(messages, finalText);
      callbacks.onDone?.(finalText, finishMetadata(meta, usage));
      return finalText;
    } catch (error: unknown) {
      throw error;
    }
  }

  public async embeddings(
    input: string[] | string,
    opts: IEmbeddingsOptions = {}
  ): Promise<IEmbeddingsResponse> {
    const modelName: string = opts.model ?? "text-embedding-004";
    const model: GenerativeModel = this.genAI.getGenerativeModel({
      model: modelName,
    });
    const meta: IMetadataRecord = startMetadata(
      "google-ai",
      modelName,
      opts.metadata
    );

    const inputs: string[] = Array.isArray(input) ? input : [input];
    const vectors: number[][] = [];

    for (const item of inputs) {
      // Using the "embedContent" endpoint via the model's embedContent method is currently not in all builds;
      // most SDKs expose a separate embedContent on GenerativeModel. Fallback: generateContent with embedding candidates is not supported.
      // We implement a graceful error if not available.
      // @ts-ignore - optional SDK surface
      if (typeof model.embedContent === "function") {
        // @ts-ignore
        const res = await model.embedContent({
          content: { parts: [{ text: item }] },
        });
        const embedding = res?.embedding?.values;
        if (!embedding)
          throw new Error(
            "Embeddings not returned by Google AI for this SDK version"
          );
        vectors.push(embedding);
      } else {
        throw new Error(
          "Google AI embeddings not available in the current SDK version. Use Vertex for full support."
        );
      }
    }
    const usage = makeUsage(inputs.join("\n"), "");
    return {
      model: modelName,
      embeddings: vectors,
      metadata: finishMetadata(meta, usage),
    };
  }
}
