import { Query } from "./Query";
import { ConnectionWrapper } from "../connection/ConnectionWrapper";

export class QueryRepository {
  constructor(public readonly connectionWrapper: ConnectionWrapper) { }

  public async send(query: Query): Promise<any> {
    try {
      return await this.connectionWrapper.connection!.query({
        sql: query.sql,
      });
    } catch (e: any) {
      console.log("QueryRepository Erorr: ", e.message);
      throw new Error(e.message);
    }
  }
}
