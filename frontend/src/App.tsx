import React from 'react';
import { RouterState } from 'connected-react-router';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import { Home } from './home';
import { Auth, loadGapi } from './auth';
import { Loggers } from './loggers';

import './App.css';

const is_authenticated = () => localStorage.getItem('authenticated') != null;

const require_auth = (nextState: RouterState, replace: Function, next: Function) => {
  if (!is_authenticated()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    });
  }

  next();
}

const log_out = (app: App) => {
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
    app.setState({});
  });
};

export class App extends React.Component {

  render() {
    const header_links_requiring_auth = is_authenticated() ? (
      <div className="user-links">
        <a href="/loggers">Loggers</a>
        <button onClick={log_out.bind(this, this)}>Log out</button>
      </div>
    ) : (
      <div className="user-links">
        <a href="/auth">Auth</a>
      </div>
    );
  
    return (
      <Router>
          <link href="https://fonts.googleapis.com/css?family=Open+Sans:100,300,400" rel="stylesheet" />
          <div className="app">
            <header className="header">
              <a href="/">Logging</a>
  
              <div className="header-ctl">
                <div className="links">
                  { header_links_requiring_auth }
                </div>
              </div>
            </header>
            <main className="content">
              <Route path="/" exact component={Home} />
              <Route path="/auth" render={() => <Auth loadGapi={loadGapi} />} />
              <Route path="/loggers" exact component={Loggers} onEnter={require_auth} />
            </main>
          </div>
      </Router>
    );
  }
}

export default App;
