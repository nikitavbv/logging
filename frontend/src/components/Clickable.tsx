import React from 'react';

type ClickableProps = {
    children: string | Element | Element[],
    onClick: () => void,
};

export const Clickable = (props: ClickableProps) => {
    return (
        <a href="#" onClick={ e => {
            e.preventDefault();
            e.stopPropagation();
            props.onClick();
            return false;
        } } style={{
            textDecoration: 'none',
            color: '#2f2f2f',
        }}>{ props.children }</a>
    );
};