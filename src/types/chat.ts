import { IMetadataRecord } from "./metadataRecord";
import { Provider } from "./provider";
import { Role } from "./role";
import { IVertexConfig } from "./vertexConfig";

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

export interface IChatInit {
  provider: Provider;
  google?: { apiKey?: string; model?: string };
  vertex?: IVertexConfig;
}
