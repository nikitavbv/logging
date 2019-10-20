import { StreamValue } from './stream_value';
import { AssertionError } from 'assert';

export class Stream<T> {
    listeners: ((arg: T) => void)[] = [];

    push(element: T) {
        this.listeners.forEach(listener => {
            listener(element);
        });
    }

    map<E>(f: (arg: T) => E, target_stream?: Stream<E>): Stream<E> {
        const stream = target_stream || new Stream<E>();
    
        this.listeners.push((arg: T) => stream.push(f(arg)));

        return stream;
    }

    forEach(f: (arg: T) => unknown): Stream<T> {
        this.listeners.push((arg: T) => {
            f(arg);
        });
        return this;
    }

    filter(f: (arg: T) => boolean, target_stream?: Stream<T>): Stream<T> {
        const stream = target_stream || new Stream<T>();

        this.listeners.push((arg: T) => {
            if (f(arg)) {
                stream.push(arg);
            }
        });

        return stream;
    }

    reduce(f: (a: T, b: T) => T, initial?: T, target_value?: StreamValue<T>): StreamValue<T> {
        const v = target_value || new StreamValue<T>(initial);
        let first_element = true;

        this.listeners.push((arg: T) => {
            if (initial === undefined && first_element) {
                v.update(arg);
                first_element = false;
                return;
            }

            const current = v.get();
            if (current === undefined) {
                throw new AssertionError({ 
                    message: 'reduce value cannot be null at non-first run'
                });
            }
            
            v.update(f(current, arg));
        });

        return v;
    }
}
