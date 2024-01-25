import { ConnectionWrapper } from "../../connection/ConnectionWrapper";
import { SyncState } from "../../connection/connectionStates/SyncState";
import { Strategy } from "../Strategy";

export class FirstStrategy implements Strategy {
  public pickNext(connections: ConnectionWrapper[]) {
    const filteredConnections = connections.filter((connection) => {
      return connection.state instanceof SyncState;
    });

    if (filteredConnections.length === 0) {
      throw new Error("No connection available");
    }

    const nextConnection = filteredConnections[0];
    return nextConnection;
  }
}
