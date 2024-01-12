import { Query } from "../../query/Query";
import { QueryRepository } from "../../query/QueryRepository";
import { ConnectionState } from "../ConnectionState";

export class SyncState implements ConnectionState {
  constructor(private queryRepository: QueryRepository) {}

  public async handleQuery(query: Query): Promise<any> {
    return await this.queryRepository.send(query);
  }
}
