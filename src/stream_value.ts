export class StreamValue<T> {
    listeners: ((arg: T) => void)[] = [];

    constructor(private value?: T) {}

    isPresent(): boolean {
        return this.value !== undefined;
    }

    get(): T | undefined {
        return this.value;
    }

    update(value: T) {
        if (value !== this.value) {
            this.listeners.forEach(listener => listener(value));
        }
        
        this.value = value;
    }

    public map<E>(f: (arg: T) => E): StreamValue<E> {
        const mapped = new StreamValue<E>();
        
        this.listeners.push(new_value => mapped.update(f(new_value)));

        return mapped;
    }
}
