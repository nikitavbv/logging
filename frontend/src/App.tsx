import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import { Home } from './home';
import { Auth, loadGapi } from './auth';
import { Loggers } from './loggers';

import './App.css';

const App: React.FC = () => {
  return (
    <Router>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:100,300,400" rel="stylesheet" />
        <div className="app">
          <header className="header">
            <a href="/">Logging</a>

            <div className="header-ctl">
              <div className="links">
                <a href="/loggers">Loggers</a>
              </div>
            </div>
          </header>
          <main className="content">
            <Route path="/" exact component={Home} />
            <Route path="/auth" render={() => <Auth loadGapi={loadGapi} />} />
            <Route path="/loggers" exact component={Loggers} />
          </main>
        </div>
    </Router>
  );
}

export default App;
