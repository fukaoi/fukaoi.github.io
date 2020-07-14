import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Create stellar keypair</h2>
      </header>
      <div className="container">
        <h2>Generate Hex 64byte</h2>
        <button>Generate</button>
        <br />
        <br />
        <br />
        <h2>Generate Stellar Keypair</h2>
        <input size={60} maxLength={64}  type="text" name="hex" placeholder="e.g: Hex 64byte string" />
        <br />
        <br />
        <button>Generate</button>
      </div>
    </div>
  );
}

export default App;
