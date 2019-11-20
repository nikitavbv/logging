import React from 'react';

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
}