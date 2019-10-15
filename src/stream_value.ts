export class StreamValue<T> {
    constructor(private value: T = undefiend) {}

    isPresent(): boolean {
        return this.value !== undefined;
    }

    get(): T {
        return this.value;
    }

    update(value: T) {
        this.value = value;
    }
}
