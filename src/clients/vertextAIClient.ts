import { AIClient } from "../types/googleAI";
import { GenerativeModel, VertexAI } from "@google-cloud/vertexai";
import { IVertexConfig } from "../types/vertexConfig";
import {
  IChatMessage,
  IChatOptions,
  IEmbeddingsOptions,
  IEmbeddingsResponse,
  IMetadataRecord,
  IStreamCallbacks,
  ITokenUsage,
} from "../types";
import {
  finishMetadata,
  makeChatUsage,
  makeUsage,
  startMetadata,
} from "../middleware";

export class VertextAIClient implements AIClient {
  private modelName: string;
  private vertex: VertexAI;

  constructor(cfg: IVertexConfig = {}) {
    const project = cfg.projectId ?? process.env.GOOGLE_CLOUD_PROJECT;
    const location =
      cfg.location ?? process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
    if (!project)
      throw new Error("GOOGLE_CLOUD_PROJECT is required for Vertex AI.");

    this.vertex = new VertexAI({ project, location });
    this.modelName = cfg.model ?? "gemini-1.5-pro";
  }

  private mapMessages(messages: IChatMessage[]) {
    return messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
  }

  public async chat(messages: IChatMessage[], options: IChatOptions = {}) {
    const model: GenerativeModel = this.vertex.getGenerativeModel({
      model: options.model ?? this.modelName,
    });
    const meta: IMetadataRecord = startMetadata(
      "vertex-ai",
      options.model ?? this.modelName,
      options.metadata
    );

    try {
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
      const text = res.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Failed to generate content");
      const usage = makeChatUsage(messages, text);
      return { text, metadata: finishMetadata(meta, usage) };
    } catch (error: unknown) {
      throw error;
    }
  }

  public async stream(
    messages: IChatMessage[],
    callbacks: IStreamCallbacks,
    options: IChatOptions = {}
  ): Promise<string> {
    const model: GenerativeModel = this.vertex.getGenerativeModel({
      model: options.model ?? this.modelName,
    });
    const meta: IMetadataRecord = startMetadata(
      "vertex-ai",
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
      for await (const item of stream.stream) {
        const token = item?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (token) {
          finalText += token;
          callbacks.onToken?.(token);
        }
      }

      const usage: ITokenUsage = makeChatUsage(messages, finalText);
      callbacks.onDone?.(finalText, finishMetadata(meta, usage));
      return finalText;
    } catch (err) {
      callbacks.onError?.(err);
      throw err;
    }
  }

  public async embeddings(
    input: string[] | string,
    opts: IEmbeddingsOptions = {}
  ): Promise<IEmbeddingsResponse> {
    const modelName: string = opts.model ?? "text-embedding-004";
    const model: GenerativeModel = this.vertex.getGenerativeModel({
      model: modelName,
    });
    const meta: IMetadataRecord = startMetadata(
      "vertex-ai",
      modelName,
      opts.metadata
    );

    const inputs: string[] = Array.isArray(input) ? input : [input];
    const vectors: number[][] = [];

    // @ts-ignore - optional SDK surface
    if (typeof model.embedContent !== "function") {
      throw new Error(
        "embedContent not available on this Vertex SDK version/model."
      );
    }

    for (const item of inputs) {
      // @ts-ignore
      const res = await model.embedContent({
        content: { parts: [{ text: item }] },
      });
      const embedding =
        res?.embedding?.values ?? res?.data?.[0]?.embedding?.values;
      if (!embedding) throw new Error("Embeddings not returned by Vertex AI");
      vectors.push(embedding);
    }

    const usage: ITokenUsage = makeUsage(inputs.join("\n"), "");
    return {
      model: modelName,
      embeddings: vectors,
      metadata: finishMetadata(meta, usage),
    };
  }
}
