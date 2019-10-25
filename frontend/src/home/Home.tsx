import React from 'react';

type HomeState = {
    logger_name_input: string,
    created_logger_id: string | undefined,
    query: string,
    query_result: any,
};

export class Home extends React.Component {
    state: HomeState;

    constructor() {
        super({});
        this.state = {
            logger_name_input: '',
            query: '',
            query_result: [],
        } as HomeState;
    }

    render() {
        return (
            <div>    
                <h1>Create logger</h1>
                { this.render_created_logger_message() }
                <input placeholder="Logger name" value={this.state.logger_name_input} onChange={this.handle_logger_name_change.bind(this)} />
                <button onClick={this.create_logger.bind(this)}>Create</button>

                <h1>Query</h1>
                <textarea value={this.state.query} onChange={this.handle_query_change.bind(this)}></textarea>
                <button onClick={this.run_query.bind(this)} style={{'display': 'block', 'margin': '8px 0'}}>Run</button>

                { this.render_query_result(this.state.query_result) }
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

    handle_query_change(event: React.FormEvent<HTMLTextAreaElement>) {
        this.setState({ ...this.state, query: event.currentTarget.value });
    }

    run_query() {
        fetch('/api/v1/query', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: this.state.query }),
        }).then(res => res.json().then(data => {
            this.setState({ ...this.state, query_result: data });
        }))
    }

    render_query_result(result: unknown) {
        if (Array.isArray(result)) {
            return this.render_query_result_table(result);
        }

        return (<div>Result: {JSON.stringify(result)}</div>)
    }

    render_query_result_table(result: any[]) {
        const columns = new Set<string>();
        result.forEach((row: any) => {
            if (typeof row === 'string') {
                return 'value';
            }
            return Object.keys(row).forEach(key => columns.add(key));
        });
        const columns_arr = (result.length > 0 && columns.size === 0) ? ['value'] : Array.from(columns);

        if (result.length > 100) {
            result = result.slice(0, 100);
        }

        return (
            <table>
                <tr>
                    {this.render_query_result_table_header(columns_arr)}
                </tr>
                {this.render_query_result_table_rows(columns_arr, result)}
            </table>
        )
    }

    render_query_result_table_header(columns: string[]) {
        return columns.map(column => (<th>{column}</th>));
    }

    render_query_result_table_rows(columns: string[], data: any[]) {
        return data.map(row => (<tr>{this.render_query_result_table_row(columns, row)}</tr>));
    }

    render_query_result_table_row(columns: string[], data: any) {
        if (typeof data !== 'object') {
            return (<td>{data}</td>)
        }

        return columns.map(column => (<td>{this.render_query_result_table_row_cell(data[column])}</td>));
    }

    render_query_result_table_row_cell(cell: any) {
        if (typeof cell === 'object') {
            return JSON.stringify(cell);
        }

        if (cell === undefined) {
            return 'undefined';
        }

        return cell.toString();
    }
}
