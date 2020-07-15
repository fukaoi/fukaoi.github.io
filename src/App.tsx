import React, {useState} from 'react';
import cryptoRandomString from 'crypto-random-string';
import {generateKeypair} from './generateKeypair';
import './App.css';

function App() {
  const [hex, setHex] = useState('');
  const [keypair, setKeypair] = useState({pubkey: '', secret: ''});
  const handleHexGen = () =>
    setHex(cryptoRandomString({length: 64}));

  const handleKeypairGen = (seed: string) =>
    setKeypair(generateKeypair(seed));


  return (
    <div className="App">
      <header className="App-header">
        <h2>Create stellar keypair</h2>
      </header>
      <div className="container">
        <h2>Generate Hex 64byte</h2>
        <button onClick={handleHexGen}>Generate</button>

        <div className="space" />

        <h2>Generate Stellar Keypair</h2>
        <input size={60} maxLength={64} type="text" name="hex" value={hex} placeholder="e.g: Hex 64byte string" />
        <button onClick={() => handleKeypairGen(hex)}>Generate</button>
        <p>pubkey: {keypair.pubkey}</p>
        <p>secret: {keypair.secret}</p>
      </div>
    </div>
  );
}

export default App;
