import * as mysql from "mysql2/promise";
import { Query } from "../query/Query";
import { ConnectionState } from "./ConnectionState";
import { UnitOfWork } from "../UnitOfWork";
import { SyncState } from "./connectionStates/SyncState";
import { QueryRepository } from "../query/QueryRepository";
import { OfflineState } from "./connectionStates/OfflineState";
import { NotSyncState } from "./connectionStates/NotSyncState";
import { ConnectionOptions } from "mysql2";
import { Logger } from "../Logger";

export class ConnectionWrapper {
  public queue: Query[] = [];
  public state: ConnectionState = new SyncState(new QueryRepository(this));
  public unitOfWork: UnitOfWork = new UnitOfWork(this);
  public connection: mysql.Connection | undefined;
  public port: number = 0;

  constructor(
    public readonly url: string,
    public readonly config: ConnectionOptions
  ) {
    this.initConnection(url, config).then();
  }

  private async initConnection(
    connectionUrl: string,
    config: ConnectionOptions
  ) {
    try {
      this.connection = await mysql.createConnection({
        ...config,
        uri: connectionUrl,
      });

      this.port = this.connection.config.port as number;
      Logger.info(`Connected to database on port: ${this.port}`);
      this.setInitialState();
    } catch (e) {
      this.state = new OfflineState();
    }
  }

  public transitionTo(state: ConnectionState): void {
    this.state = state;
  }

  public async handleQuery(query: Query): Promise<any> {
    if (query.type === "write") {
      if (this.state instanceof SyncState) {
        this.transitionTo(new NotSyncState(new QueryRepository(this)));
      }
      this.queue.push(query);
      if (this.state instanceof NotSyncState) {
        await this.state.handleQueue();
        this.transitionTo(new SyncState(new QueryRepository(this)));
      }

      return;
    }

    if (this.state instanceof SyncState) {
      return await this.state.handleQuery(query);
    }
  }

  private setInitialState() {
    if (this.queue.length) {
      this.state = new NotSyncState(new QueryRepository(this));
      (this.state as NotSyncState).handleQueue().then(() => {
        this.state = new SyncState(new QueryRepository(this));
      });
    } else {
      this.state = new SyncState(new QueryRepository(this));
    }
  }

  public async isActive(): Promise<void> {
    try {
      if (!this.connection) {
        await this.initConnection(this.url, this.config);
        return;
      }

      await this.connection.query({
        sql: "SELECT 1;",
        timeout: 1000,
      });

      if (this.state instanceof OfflineState) {
        Logger.info(`Connection to database on port ${this.port} was restored`);
      }

      this.setInitialState();
    } catch (err) {
      Logger.error(`Connection to database on port ${this.port} was lost`);
      this.transitionTo(new OfflineState());
      this.connection = undefined;
    }
  }
}
