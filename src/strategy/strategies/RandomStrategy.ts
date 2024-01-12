import { ConnectionWrapper } from "../../connection/ConnectionWrapper";
import { Strategy } from "../Strategy";

export class RandomStrategy implements Strategy {
  public pickNext(connections: ConnectionWrapper[]) {
    const nextConnection = connections[Math.random() * connections.length];
    return nextConnection;
  }
}
