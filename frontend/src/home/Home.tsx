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
}
