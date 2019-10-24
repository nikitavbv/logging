import React from 'react';

type HomeState = {
    logger_name_input: string,
    created_logger_id: string | undefined,
};

export class Home extends React.Component {
    state: HomeState;

    constructor() {
        super({});
        this.state = {
            logger_name_input: '',
        } as HomeState;
    }

    render() {
        return (
            <div>
                home
    
                <h1>Create logger</h1>
                { this.render_created_logger_message() }
                <input placeholder="Logger name" value={this.state.logger_name_input} onChange={this.handle_logger_name_change.bind(this)} />
                <button onClick={this.create_logger.bind(this)}>Create</button>
            </div>
        );
    }

    render_created_logger_message() {
        if (this.state.created_logger_id === undefined) {
            return (<div></div>);
        }

        return (<div className="created_logger_message">Logger created: {this.state.created_logger_id}</div>);
    }

    handle_logger_name_change(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ ...this.state, logger_name_input: event.currentTarget.value });
    }

    create_logger() {
        this.setState({ ...this.state, logger_name_input: '' });

        fetch('/api/v1/logger', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: this.state.logger_name_input
            })
        }).then(res => res.json().then(data => {
            this.setState({ ...this.state, created_logger_id: data.logger_id });
        }));
    }
}
