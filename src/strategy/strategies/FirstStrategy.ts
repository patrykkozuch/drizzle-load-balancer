import { ConnectionWrapper } from "../../connection/ConnectionWrapper";
import { Strategy } from "../Strategy";

export class FirstStrategy implements Strategy {
  public pickNext(connections: ConnectionWrapper[]) {
    const nextConnection = connections[0];
    return nextConnection;
  }
}
