import { IMetadataRecord } from "./metadataRecord";

export interface IEmbeddingsResponse {
  model: string;
  embeddings: number[][];
  metadata: IMetadataRecord;
}

export interface EmbeddingsOptions {
  model?: string;
  metadata?: Record<string, any>;
}
