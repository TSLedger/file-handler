export class Mutex {
  private waiting: (() => void)[] = [];

  public async acquire(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
    if (this.waiting.length === 1) {
      this.release();
    }
    await promise;
  }

  public release(): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      if (next) {
        next();
      }
    }
  }
}
