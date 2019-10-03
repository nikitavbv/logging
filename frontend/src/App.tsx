import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import { Auth, loadGapi } from './auth';

const App: React.FC = () => {
  return (
    <Router>
        <div className="app">
          <header className="header">
            header  
          </header>
          <div className="content">
            <Route path="/" exact component={Home}/>
            <Route path="/auth" render={() => <Auth loadGapi={loadGapi} />}/>
          </div>
        </div>
    </Router>
  );
}

export default App;
