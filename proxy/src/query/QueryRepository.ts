import { Query } from "./Query";
import { ConnectionWrapper } from "../connection/ConnectionWrapper";
import { Logger } from "../Logger";

export class QueryRepository {
  constructor(public readonly connectionWrapper: ConnectionWrapper) {}

  public async send(query: Query): Promise<any> {
    try {
      Logger.log(
        `Executing query of type ${query.type}(${query.sql}) on database on port: ${this.connectionWrapper.port}`
      );
      return await this.connectionWrapper.connection!.query({
        sql: query.sql,
        values: query.params,
        rowsAsArray: query.method === 'all',
        typeCast: function(field: any, next: any) {
          if (field.type === 'TIMESTAMP' || field.type === 'DATETIME' || field.type === 'DATE') {
            return field.string();
          }
          return next();
        },
      });
    } catch (e: any) {
      Logger.error("QueryRepository Erorr: " + e.message);
      throw new Error(e.message);
    }
  }
}
