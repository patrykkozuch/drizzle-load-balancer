import { Query } from "../query/Query";

export interface ConnectionState {
  handleQuery?(query: Query): void;
  handleQueue?(): void;
}
