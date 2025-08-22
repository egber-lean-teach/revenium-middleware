import { BaseAIClient } from "./BaseAIClient";
import { IChatOptions } from "../types/chat";
import { startMetadata } from "../middleware/metadata";
import { VertexAI } from "@google-cloud/vertexai";

export class VertexAIClient extends BaseAIClient {
  private vertex: VertexAI;

  constructor(cfg: any = {}) {
    super(cfg.model);
    const project = cfg.projectId ?? process.env.GOOGLE_CLOUD_PROJECT;
    const location =
      cfg.location ?? process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
    if (!project) throw new Error("GOOGLE_CLOUD_PROJECT is required");
    this.vertex = new VertexAI({ project, location });
  }

  protected getModel(options: IChatOptions) {
    const model = this.vertex.getGenerativeModel({
      model: options.model ?? this.modelName,
    });
    const meta = startMetadata(
      "vertex-ai",
      options.model ?? this.modelName,
      options.metadata
    );
    return { model, meta };
  }

  protected extractText(res: any) {
    return res.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  protected extractStreamToken(chunk: any) {
    return chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  protected async embedItem(model: any, item: string) {
    const res = await model.embedContent({
      content: { parts: [{ text: item }] },
    });
    return res?.embedding?.values ?? res?.data?.[0]?.embedding?.values ?? [];
  }
}
