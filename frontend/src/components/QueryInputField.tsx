import React from 'react';

type RunQueryState = {
    query: string,
    query_result: any,
};

export class QueryInputField extends React.Component {

    render() {
        return (
            <div>
                <h1>Query</h1>
                <textarea rows={8} value={this.state.query} onChange={this.handle_query_change.bind(this)}></textarea>
                <button onClick={this.run_query.bind(this)} style={{'display': 'block', 'margin': '8px 0'}}>Run</button>

                { this.render_query_result(this.state.query_result) }
            </div>
        );
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