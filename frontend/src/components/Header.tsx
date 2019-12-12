import React from 'react';

const is_authenticated = () => localStorage.getItem('authenticated') != null;

const log_out = (component: React.Component) => {
    localStorage.removeItem('authenticated');
    fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(() => {
        window.location.href = '/home';
        component.setState({});
    });
};

export class Header extends React.Component {

    render() {
        const header_links_requiring_auth = is_authenticated() ? (
            <div className="user-links">
                <button onClick={log_out.bind(this, this)}>Log out</button>
            </div>
        ) : (
            <div className="user-links">
                <a href="/auth">Auth</a>
            </div>
        );


        return (
            <header className="header">
                <a href="/">Logging</a>

                <div className="header-ctl">
                    <div className="links">
                        {header_links_requiring_auth}
                    </div>
                
                </div>
            </header>
        );
    }
}