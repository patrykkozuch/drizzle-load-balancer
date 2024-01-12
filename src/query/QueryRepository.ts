import { Query } from "./Query";
import { ConnectionWrapper } from "../connection/ConnectionWrapper";

export class QueryRepository {
  constructor(public readonly connectionWrapper: ConnectionWrapper) {}

  public async send(query: Query): Promise<any> {
    try {
      const result = await this.connectionWrapper.connection.query({
        sql: query.sql,
      });

      return result;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}
