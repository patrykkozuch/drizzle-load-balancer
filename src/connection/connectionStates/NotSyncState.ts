import { Query } from "../../query/Query";
import { QueryRepository } from "../../query/QueryRepository";
import { ConnectionState } from "../ConnectionState";

export class NotSyncState implements ConnectionState {
  constructor(private queryRepository: QueryRepository) {}

  public handleQuery(query: Query): void {
    this.queryRepository.send(query);
  }

  public async handleQueue(): Promise<void> {
    this.queryRepository.connectionWrapper.unitOfWork.begin();
    try {
      while (this.queryRepository.connectionWrapper.queue.length > 0) {
        const query = this.queryRepository.connectionWrapper.queue.shift()!;
        await this.queryRepository.send(query);
      }

      this.queryRepository.connectionWrapper.unitOfWork.commit();
    } catch (err: any) {
      this.queryRepository.connectionWrapper.unitOfWork.rollback();
      throw new Error(err);
    }
  }
}
