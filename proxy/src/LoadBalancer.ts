import { ConnectionOptions } from "mysql2";
import { StrategyType } from "./strategy/StrategyTypes";
import { Strategy } from "./strategy/Strategy";
import { RoundRobinStrategy } from "./strategy/strategies/RoundRobinStrategy";
import { RandomStrategy } from "./strategy/strategies/RandomStrategy";
import { FirstStrategy } from "./strategy/strategies/FirstStrategy";
import { ConnectionWrapper } from "./connection/ConnectionWrapper";
import { Query } from "./query/Query";
import { NotSyncState } from "./connection/connectionStates/NotSyncState";
import { QueryRepository } from "./query/QueryRepository";
import { OfflineState } from "./connection/connectionStates/OfflineState";
import { Logger } from "./Logger";

export class LoadBalancer {
  private strategy: Strategy;
  private readonly connections: ConnectionWrapper[] = [];

  constructor(
    connectionUrls: string[],
    config: ConnectionOptions,
    strategy: StrategyType = StrategyType.RANDOM
  ) {
    this.strategy = new RandomStrategy();
    this.changeStrategy(strategy);
    this.runHealthCheck();
    this.connections = connectionUrls.map(
      (url) => new ConnectionWrapper(url, config)
    );
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
    if (query.type === "write") {
      for (const connection of this.connections) {
        if (!(connection.state instanceof OfflineState)) {
          connection.transitionTo(
            new NotSyncState(new QueryRepository(connection))
          );
        }

        try {
          await connection.handleQuery(query);
        } catch (e: any) {
          Logger.error("LoadBalancer Error with handleQuery: " + e);
          return { status: 500, message: e };
        }
      }

      return { status: 200, message: "Database changed" };
    }

    try {
      const connection = this.strategy.pickNext(this.connections);
      return await connection.handleQuery(query);
    } catch (e: any) {
      Logger.error("LoadBalancer Error with pickNext: " + e.message);
      return { status: 500, message: "No connection available" };
    }
  }

  public async runHealthCheck() {
    setInterval(() => {
      const promises: Promise<void>[] = [];
      this.connections.forEach((connection) => {
        const promise = async () => {
          await connection.isActive();
        };
        promises.push(promise());
      });
      Promise.all(promises);
    }, 5000);
  }
}
