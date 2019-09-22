import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Auth from './Auth';

const App: React.FC = () => {
  return (
    <Router>
        <div className="app">
          <header className="header">
            header
          </header>
          <div className="content">
            <Route path="/" component={Home}/>
            <Route path="/auth" component={Auth}/>
          </div>
        </div>
    </Router>
  );
}

export default App;
