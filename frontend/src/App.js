// src/App.js - Make sure it looks like this
import React from 'react';
import AppRoutes from './routes'; // This should import the default export from routes/index.js
import './App.css';

function App() {
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;