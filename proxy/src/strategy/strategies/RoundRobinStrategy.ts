import { ConnectionWrapper } from "../../connection/ConnectionWrapper";
import { SyncState } from "../../connection/connectionStates/SyncState";
import { Strategy } from "../Strategy";

export class RoundRobinStrategy implements Strategy {
  private lastValueId = 0;

  public pickNext(connections: ConnectionWrapper[]) {
    const connectionsLength = connections.length;
    let i = (this.lastValueId + 1) % connectionsLength;
    while (i !== this.lastValueId) {
      if (connections[i].state instanceof SyncState) {
        this.lastValueId = i;
        return connections[i];
      }
      i = (i + 1) % connectionsLength;
    }

    if (connections[this.lastValueId].state instanceof SyncState) {
      return connections[this.lastValueId];
    }
    throw new Error("No connection available");

  }
}
