import { ConnectionWrapper } from "./connection/ConnectionWrapper";
import { QueryRepository } from "./query/QueryRepository";

export class UnitOfWork {
  public repository: QueryRepository = new QueryRepository(this.context);

  constructor(private context: ConnectionWrapper) {}

  public async begin() {
    await this.context.connection!.beginTransaction();
  }

  public async commit() {
    await this.context.connection!.commit();
  }

  public async rollback() {
    await this.context.connection!.rollback();
  }
}
