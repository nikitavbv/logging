import React from 'react';

type Logger = {
    name: string,
    id: string
}

type LoggersState = {
    logger_name_input: string,
    created_logger_api_key: string | undefined,
    loggers: Logger[],
};

export class Loggers extends React.Component {
    state: LoggersState;

    constructor() {
        super({});
        this.state = {
            logger_name_input: '',
            created_logger_api_key: undefined,
            loggers: [],
        } as LoggersState;

        this.request_loggers();
    }

    render() {
        return (
            <div>
                <h1>Create logger</h1>
                { this.render_created_logger_message() }
                <input placeholder="Logger name" value={this.state.logger_name_input} onChange={this.handle_logger_name_change.bind(this)} />
                <button onClick={this.create_logger.bind(this)}>Create</button>

                <h1>Loggers</h1>
                { this.render_loggers_list(this.state.loggers) }
            </div>
        );
    }

    request_loggers() {
        fetch('/api/v1/logger', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(data => this.setState({ ...this.state, loggers: data.loggers }));
    }

    render_created_logger_message() {
        if (this.state.created_logger_api_key === undefined) {
            return (<div></div>);
        }

        return (<div className="created_logger_message">Logger created. API key: {this.state.created_logger_api_key}. This will not be shown to you later, please save it.</div>);
    }

    handle_logger_name_change(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ ...this.state, logger_name_input: event.currentTarget.value });
    }

    create_logger() {
        const name = this.state.logger_name_input;
        this.setState({ ...this.state, logger_name_input: '' });

        fetch('/api/v1/logger', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
            })
        }).then(res => res.json().then(data => {
            this.setState({ ...this.state, created_logger_api_key: data.api_key, loggers: [...this.state.loggers, {
                name,
                id: data.logger_id, 
            }] });
        }));
    }

    render_loggers_list(loggers: Logger[]) {
        return (
            <table>
                <tr>
                    <th>Name</th>
                    <th>ID</th>
                </tr>
                { loggers.map(logger => this.render_loggers_list_row(logger)) }
            </table>
        )
    }

    render_loggers_list_row(logger: Logger) {
        return (
            <tr>
                <td>{ logger.name }</td>
                <td>{ logger.id }</td>
            </tr>
        )
    }
}