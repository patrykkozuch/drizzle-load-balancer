import { Query } from "../../query/Query";
import { QueryRepository } from "../../query/QueryRepository";
import { ConnectionState } from "../ConnectionState";

export class NotSyncState implements ConnectionState {
  private previousQuery: Query[] = [];
  constructor(private queryRepository: QueryRepository) { }

  public async handleQueue(): Promise<void> {
    // console.log(this)
    this.previousQuery = [];
    await this.queryRepository.connectionWrapper.unitOfWork.begin();
    try {
      while (this.queryRepository.connectionWrapper.queue.length > 0) {
        const query = this.queryRepository.connectionWrapper.queue.shift()!;
        this.previousQuery.push(query);
        await this.queryRepository.send(query);
      }

      await this.queryRepository.connectionWrapper.unitOfWork.commit();
    } catch (err: any) {
      console.log("NotSyncState Error:", err.message);
      if (err.message.includes("Can't add new command when connection is in closed state")) {
        this.queryRepository.connectionWrapper.queue = this.previousQuery.concat(this.queryRepository.connectionWrapper.queue);
      }
      else {
        await this.queryRepository.connectionWrapper.unitOfWork.commit();
        await this.handleQueue();
        return;
      }
      await this.queryRepository.connectionWrapper.unitOfWork.rollback();
      throw new Error(err);
    }
  }
}
