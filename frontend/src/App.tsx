import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Landing from './Landing';
import { Home } from './home';
import { Auth, loadGapi } from './auth';

import './App.css';

const App: React.FC = () => {
  return (
    <Router>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:100,300,400" rel="stylesheet" />
        <div className="app">
          <header className="header">
            Logging

            <div className="header-ctl">
              <div className="links">
                <a href="/">Loggers</a>
              </div>
            </div>
          </header>
          <main className="content">
            <Route path="/" exact component={Landing} />
            <Route path="/auth" render={() => <Auth loadGapi={loadGapi} />} />
            <Route path="/home" exact component={Home} />
          </main>
        </div>
    </Router>
  );
}

export default App;
