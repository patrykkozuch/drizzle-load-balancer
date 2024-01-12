import { Query } from "../../query/Query";
import { QueryRepository } from "../../query/QueryRepository";
import { ConnectionState } from "../ConnectionState";

export class OfflineState implements ConnectionState {
  constructor(private queryRepository: QueryRepository) {}

  public handleQuery(query: Query): void {
    this.queryRepository.send(query);
  }
}
