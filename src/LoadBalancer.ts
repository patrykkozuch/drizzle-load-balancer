import { ConnectionOptions } from "mysql2";
import { StrategyType } from "./strategy/StrategyTypes";
import { Strategy } from "./strategy/Strategy";
import { RoundRobinStrategy } from "./strategy/strategies/RoundRobinStrategy";
import { RandomStrategy } from "./strategy/strategies/RandomStrategy";
import { FirstStrategy } from "./strategy/strategies/FirstStrategy";
import * as mysql from "mysql2/promise";
import { ConnectionWrapper } from "./connection/ConnectionWrapper";
import { Query } from "./query/Query";
import { NotSyncState } from "./connection/connectionStates/NotSyncState";
import { QueryRepository } from "./query/QueryRepository";
import { OfflineState } from "./connection/connectionStates/OfflineState";

export class LoadBalancer {
  private strategy: Strategy;
  private connections: ConnectionWrapper[] = [];

  constructor(
    connectionUrls: string[],
    config: ConnectionOptions,
    strategy: StrategyType = StrategyType.RANDOM
  ) {
    this.strategy = new RandomStrategy();
    this.changeStrategy(strategy);
    this.runHealthCheck();
    connectionUrls.map((url) => this.initConnection(url, config));
  }

  private async initConnection(
    connectionUrl: string,
    config: ConnectionOptions
  ) {
    const connection = await mysql.createConnection({
      ...config,
      host: connectionUrl,
    });

    this.connections.push(new ConnectionWrapper(connection));
  }

  public changeStrategy(strategyType: StrategyType) {
    switch (strategyType) {
      case StrategyType.RANDOM:
        this.strategy = new RandomStrategy();
        break;
      case StrategyType.ROUND_ROBIN:
        this.strategy = new RoundRobinStrategy();
        break;
      default:
        this.strategy = new FirstStrategy();
    }
  }

  public async routeQuery(query: Query) {
    let connection;
    try {
      connection = this.strategy.pickNext(this.connections);
    } catch (e) {
      return "No connection available";
    }
    if (query.type === "write") {
      this.connections.forEach((connection) => {
        connection.transitionTo(
          new NotSyncState(new QueryRepository(connection))
        );
        try {
          connection.handleQuery(query);
        } catch (e) {
          return "Something went wrong";
        }
      });

      return { status: 200, message: "Database changed" };
    }

    return await connection.handleQuery(query);
  }

  public async runHealthCheck() {
    setInterval(() => {
      this.connections.forEach(async (connection) => {
        if (connection.state instanceof OfflineState) {
          await connection.isActive();
        }
      });
    }, 5000);
  }
}
