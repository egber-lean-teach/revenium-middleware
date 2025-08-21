import { Role } from "./role";

export interface IChatMessage {
  role: Role;
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  metadata?: Record<string, any>;
}
