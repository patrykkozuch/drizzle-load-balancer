import { Query } from "../../query/Query";
import { QueryRepository } from "../../query/QueryRepository";
import { ConnectionState } from "../ConnectionState";

export class NotSyncState implements ConnectionState {
  constructor(private queryRepository: QueryRepository) {}

  public async handleQueue(): Promise<void> {
    console.log(this)
    await this.queryRepository.connectionWrapper.unitOfWork.begin();
    try {
      while (this.queryRepository.connectionWrapper.queue.length > 0) {
        const query = this.queryRepository.connectionWrapper.queue.shift()!;
        await this.queryRepository.send(query);
      }

      await this.queryRepository.connectionWrapper.unitOfWork.commit();
    } catch (err: any) {
      await this.queryRepository.connectionWrapper.unitOfWork.rollback();
      throw new Error(err);
    }
  }
}
