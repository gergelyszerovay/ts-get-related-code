import { ServerState } from "../../ServerState";

export type GetRelatedCode = {
  _id?: string;
  _event: "getRelatedCode";
  _apiKey?: Record<string, string>;
  _serverState?: ServerState;
  declarationIds: ReadonlyArray<string>;
};
