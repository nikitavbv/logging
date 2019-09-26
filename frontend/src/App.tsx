import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Auth from './Auth';

const loadGapi = () => new Promise((resolve, _) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = resolve;
});

const App: React.FC = () => {
  return (
    <Router>
        <div className="app">
          <header className="header">
            header  
          </header>
          <div className="content">
            <Route path="/" exact component={Home}/>
            <Route path="/auth" component={Auth}/>
          </div>
        </div>
    </Router>
  );
}

export default App;
