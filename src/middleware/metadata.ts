import { IMetadataRecord } from "../types/metadataRecord";
import { ITokenUsage } from "../types/tokenUsage";

export function startMetadata(
  provider: IMetadataRecord["provider"],
  model: string,
  extra?: Record<string, any>
): IMetadataRecord {
  return {
    provider,
    model,
    startedAt: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    extra,
  };
}

export function finishMetadata(
  meta: IMetadataRecord,
  tokenUsage?: ITokenUsage
): IMetadataRecord {
  const finishedAt: Date = new Date();
  const startedAt: Date = new Date(meta.startedAt);
  return {
    ...meta,
    finishedAt: finishedAt.toISOString(),
    latencyMs: finishedAt.getTime() - startedAt.getTime(),
    tokenUsage: tokenUsage ?? meta.tokenUsage,
  };
}
