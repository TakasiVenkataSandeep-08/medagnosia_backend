"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchWriter = void 0;
class BatchWriter {
    constructor(batchSize, firestore) {
        this.batchSize = batchSize;
        this.firestore = firestore;
        this.batches = [];
        this.currentBatch = null;
        this.currentBatchCount = 0;
    }
    getBatch() {
        if (!this.currentBatch || this.currentBatchCount === this.batchSize) {
            this.currentBatch = this.firestore.batch();
            this.batches.push(this.currentBatch);
            this.currentBatchCount = 0;
        }
        this.currentBatchCount++;
        return this.currentBatch;
    }
    async commitAll() {
        return Promise.all(this.batches.map((batch) => batch.commit()));
    }
}
exports.BatchWriter = BatchWriter;
//# sourceMappingURL=BatchWriter.js.map