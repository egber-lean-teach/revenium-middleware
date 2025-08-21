import { Provider } from "./provider";
import { ITokenUsage } from "./tokenUsage";

export interface IMetadataRecord {
  provider: Provider;
  model: string;
  startedAt: string; // ISO
  finishedAt?: string; // ISO
  latencyMs?: number;
  requestId?: string;
  tokenUsage?: ITokenUsage;
  extra?: Record<string, any>;
}
