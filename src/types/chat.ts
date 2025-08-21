import { IMetadataRecord } from "./metadataRecord";
import { Role } from "./role";

export interface IChatMessage {
  role: Role;
  content: string;
}

export interface IChatOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  metadata?: Record<string, any>;
}

export interface IChatResponse {
  text: string;
  metadata: IMetadataRecord;
}
