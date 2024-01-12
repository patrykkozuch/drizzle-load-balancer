import { ConnectionWrapper } from "../../connection/ConnectionWrapper";
import { SyncState } from "../../connection/connectionStates/SyncState";
import { Strategy } from "../Strategy";

export class RoundRobinStrategy implements Strategy {
  private lastValueId = 0;

  public pickNext(connections: ConnectionWrapper[]) {
    const filteredConnections = connections.filter((connection) => {
      return connection.state instanceof SyncState;
    });

    if (filteredConnections.length === 0) {
      throw new Error("No connection available");
    }

    this.lastValueId = (this.lastValueId + 1) % filteredConnections.length;
    const nextConnection = filteredConnections[this.lastValueId];
    return nextConnection;
  }
}
