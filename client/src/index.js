import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';

import './index.css';

import Main from './Components/MainPage/mainpage.js';
import Login from './Components/Login/loginpage.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <div>
        {/* 👇️ Wrap your Route components in a Routes component */}
        <Routes>
          <Route path="/dashboard" element={<Main />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  </React.StrictMode>
);
