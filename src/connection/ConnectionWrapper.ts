import * as mysql from "mysql2/promise";
import { Query } from "../query/Query";
import { ConnectionState } from "./ConnectionState";
import { UnitOfWork } from "../UnitOfWork";
import { SyncState } from "./connectionStates/SyncState";
import { QueryRepository } from "../query/QueryRepository";
import { OfflineState } from "./connectionStates/OfflineState";
import { NotSyncState } from "./connectionStates/NotSyncState";

export class ConnectionWrapper {
  public queue: Query[] = [];
  private state: ConnectionState = new SyncState(new QueryRepository(this));
  public unitOfWork: UnitOfWork = new UnitOfWork(this);

  constructor(public readonly connection: mysql.Connection) {}

  public transitionTo(state: ConnectionState): void {
    this.state = state;
  }

  public handleQuery(query: Query): void {
    if (query.type === "write") {
      if (this.state instanceof SyncState) {
        this.transitionTo(new NotSyncState(new QueryRepository(this)));
      }
      this.queue.push(query);
      this.state.handleQueue();

      return;
    }

    this.queue.push(query);
    this.state.handleQuery(query);
  }

  public async isActive(): Promise<void> {
    try {
      await this.connection.query({
        sql: "SELECT 1;",
        timeout: 1000,
      });
    } catch (err) {
      this.transitionTo(new OfflineState(new QueryRepository(this)));
    }
  }
}
