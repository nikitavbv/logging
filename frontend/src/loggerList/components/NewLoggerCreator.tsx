import React, { useState } from 'react';

type NewLoggerCreatorProps = {
    onLoggerNameSelected: (name: string) => void,
};

export const NewLoggerCreator = (props: NewLoggerCreatorProps) => {
    const [ newLoggerName, updateNewLoggerName ] = useState('');

    return (
        <div>
            <input placeholder='New logger name' style={{ width: '80%' }} value={newLoggerName} onChange={e => updateNewLoggerName(e.currentTarget.value)} />
            <button style={{ width: '15%', margin: '0 8px' }} onClick={() => props.onLoggerNameSelected(newLoggerName)}>Create</button>
        </div>
    );
};