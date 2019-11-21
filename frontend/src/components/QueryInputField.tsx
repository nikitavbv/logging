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
}