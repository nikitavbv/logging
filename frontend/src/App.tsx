import React from 'react';
import { HashRouter, Route } from 'react-router';
import './App.css';
import Signin from './Signin';

const App: React.FC = () => {
  return (
    <HashRouter>
        <div className="app">
          <header className="header">
            header
          </header>
          <div className="content">
            <Route path="/" component={Home}/>
            <Route path="/signin" component={Signin}/>
          </div>
        </div>
    </HashRouter>
  );
}

export default App;
