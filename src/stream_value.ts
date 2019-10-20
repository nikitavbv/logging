export class StreamValue<T> {
    constructor(private value?: T) {}

    isPresent(): boolean {
        return this.value !== undefined;
    }

    get(): T | undefined {
        return this.value;
    }

    update(value: T) {
        this.value = value;
    }
}
