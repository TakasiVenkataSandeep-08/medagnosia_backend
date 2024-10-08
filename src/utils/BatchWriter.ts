import { Firestore, WriteBatch } from "@google-cloud/firestore";

export class BatchWriter {
  private batchSize: number;
  private firestore: Firestore;
  private batches: WriteBatch[];
  private currentBatch: WriteBatch | null;
  private currentBatchCount: number;

  constructor(batchSize: number, firestore: Firestore) {
    this.batchSize = batchSize;
    this.firestore = firestore;
    this.batches = [];
    this.currentBatch = null;
    this.currentBatchCount = 0;
  }

  getBatch(): WriteBatch {
    if (!this.currentBatch || this.currentBatchCount === this.batchSize) {
      this.currentBatch = this.firestore.batch();
      this.batches.push(this.currentBatch);
      this.currentBatchCount = 0;
    }
    this.currentBatchCount++;
    return this.currentBatch;
  }

  async commitAll(): Promise<FirebaseFirestore.WriteResult[][]> {
    return Promise.all(this.batches.map((batch) => batch.commit()));
  }
}
