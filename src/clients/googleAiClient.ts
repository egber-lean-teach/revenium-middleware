import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAIClient } from "./BaseAIClient";
import { IChatOptions } from "../types/chat";
import { startMetadata } from "../middleware/metadata";

export class GoogleAiClient extends BaseAIClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string, modelName?: string) {
    super(modelName);
    const key = apiKey ?? process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GOOGLE_API_KEY is required");
    this.genAI = new GoogleGenerativeAI(key);
  }

  protected getModel(options: IChatOptions) {
    const model = this.genAI.getGenerativeModel({
      model: options.model ?? this.modelName,
    });
    const meta = startMetadata(
      "google-ai",
      options.model ?? this.modelName,
      options.metadata
    );
    return { model, meta };
  }

  protected extractText(res: any) {
    return res.response?.text();
  }

  protected extractStreamToken(chunk: any) {
    return chunk?.text();
  }

  protected async embedItem(model: any, item: string) {
    const res = await model.embedContent({
      content: { parts: [{ text: item }] },
    });
    return res?.embedding?.values ?? [];
  }
}
