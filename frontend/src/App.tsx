import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Landing from './Landing';
import { Home } from './home';
import { Auth, loadGapi } from './auth';

const App: React.FC = () => {
  return (
    <Router>
        <div className="app">
          <header className="header">
            logging  
          </header>
          <div className="content">
            <Route path="/" exact component={Landing} />
            <Route path="/auth" render={() => <Auth loadGapi={loadGapi} />} />
            <Route path="/home" exact component={Home} />
          </div>
        </div>
    </Router>
  );
}

export default App;
