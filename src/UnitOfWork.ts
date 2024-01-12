import { ConnectionWrapper } from "./connection/ConnectionWrapper";
import { QueryRepository } from "./query/QueryRepository";

export class UnitOfWork {
  public repository: QueryRepository = new QueryRepository(this.context);

  constructor(private context: ConnectionWrapper) {}

  public begin(): void {
    this.context.connection.beginTransaction();
  }

  public commit(): void {
    this.context.connection.commit();
  }

  public rollback(): void {
    this.context.connection.rollback();
  }
}
