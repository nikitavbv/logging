import React, { useState } from 'react';

type NewQueryCreatorProps = {
    onQueryNameSelected: (name: string) => void,
};

export const NewQueryCreator = (props: NewQueryCreatorProps) => {
    const [ newQueryName, updateQueryName ] = useState('');

    return (
        <div>
            <input placeholder='New query name' style={{ width: '80%' }} value={newQueryName} onChange={e => updateQueryName(e.currentTarget.value)} />
            <button style={{ width: '15%', margin: '0 8px' }} onClick={() => props.onQueryNameSelected(newQueryName)}>Create</button>
        </div>
    );
};