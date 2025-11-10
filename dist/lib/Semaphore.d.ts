export declare class Semaphore {
    private permits;
    private queue;
    constructor(permits: number);
    acquire(): Promise<void>;
    release(): void;
}
