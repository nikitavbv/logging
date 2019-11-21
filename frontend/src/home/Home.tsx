import React from 'react';

import { UserQueriesList, QueryInputField } from '../components';

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
                <QueryInputField />
                <UserQueriesList />
            </div>
        );
    }

    handle_query_change(event: React.FormEvent<HTMLTextAreaElement>) {
        this.setState({ ...this.state, query: event.currentTarget.value });
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
