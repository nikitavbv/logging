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

    reduce(f: (a: T, b: T) => T, initial: T = undefined): StreamValue<T> {
        const v = new StreamValue<T>(initial);
        let firstElement = true;

        this.listeners.push((arg: T) => {
            if (initial === undefined && firstElement) {
                v.update(arg);
                firstElement = false;
                return;
            }

            v.update(f(v.get(), arg));
        });

        return v;
    }
}
