export class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    while (this.permits <= 0) {
      // Wait until a permit is released
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.permits--; // Decrement AFTER being released from the queue
  }

  release(): void {
    this.permits++;
    // Notify the next waiting acquirer, if any
    const next = this.queue.shift();
    if (next) next();
  }
}