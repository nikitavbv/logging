export class Stream<T> {
    listeners: ((arg: T) => void)[] = [];

    push(element: T) {
        this.listeners.forEach(listener => {
            listener(element);
        });
    }

    map<E>(f: (arg: T) => E): Stream<E> {
        const stream = new Stream<E>();
    
        this.listeners.push((arg: T) => {
            stream.push(f(arg));
        });

        return stream;
    }

    forEach(f: (arg: T) => unknown): Stream<T> {
        this.listeners.push((arg: T) => {
            f(arg);
        });
        return this;
    }

    filter(f: (arg: T) => boolean): Stream<T> {
        const stream = new Stream<T>();

        this.listeners.push((arg: T) => {
            if (f(arg)) {
                stream.push(arg);
            }
        });

        return stream;
    }
}
