import React from 'react';
import { RouterState } from 'connected-react-router';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import { Home } from './home';
import { Auth, loadGapi } from './auth';
import { Loggers } from './loggers';

import { Header } from './components';

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


export class App extends React.Component {

  render() {
    return (
      <Router>
          <link href="https://fonts.googleapis.com/css?family=Open+Sans:100,300,400" rel="stylesheet" />
          <div className="app">
            <Header />
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
