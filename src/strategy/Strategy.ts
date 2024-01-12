import { ConnectionWrapper } from "../connection/ConnectionWrapper";

export interface Strategy {
  pickNext(connections: ConnectionWrapper[]): ConnectionWrapper;
}
