import { ConnectionWrapper } from "./connection/ConnectionWrapper";
import { QueryRepository } from "./query/QueryRepository";

export class UnitOfWork {
  public repository: QueryRepository = new QueryRepository(this.context);

  constructor(private context: ConnectionWrapper) {}

  public begin(): void {}

  public commit(): void {}

  public rollback(): void {}
}
