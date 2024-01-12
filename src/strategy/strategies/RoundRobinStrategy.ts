import { ConnectionWrapper } from "../../connection/ConnectionWrapper";
import { Strategy } from "../Strategy";

export class RoundRobinStrategy implements Strategy {
  private lastValueId = 0;

  public pickNext(connections: ConnectionWrapper[]) {
    const nextConnection = connections[this.lastValueId];
    this.lastValueId = (this.lastValueId + 1) % connections.length;
    return nextConnection;
  }
}
