import { IMetadataRecord } from "./metadataRecord";

export interface IStreamCallbacks {
  onToken?: (token: string) => void;
  onEvent?: (event: { type: string; data?: any }) => void;
  onDone?: (finalText: string, meta: IMetadataRecord) => void;
  onError?: (err: unknown) => void;
}
