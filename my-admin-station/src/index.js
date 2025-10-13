import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route} from 'react-router';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Network from './elements/network';
import Stats from './elements/stats';
import System from './elements/system';
import Navbar from './elements/layout/navbar';
import Footer from './elements/layout/footer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/system" element={<System />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/network" element={<Network />} />
      </Routes>
      <Footer />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
