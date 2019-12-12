import React from 'react';

type APIKeyDisplayProps = {
    apiKey: string,
    onHide: () => void,
};

export const APIKeyDisplay = (props: APIKeyDisplayProps) => {
    return (
        <div>
            new logger api key: <b>{ props.apiKey }</b>
            <button onClick={props.onHide} style={{ width: '100%' }}>ok</button>
        </div>
    );
};