import React, {useState} from 'react';
import cryptoRandomString from 'crypto-random-string';
import {generateKeypair} from './generateKeypair';
import './App.css';

function App() {
  const [seed, setSeed] = useState('');
  const [keypair, setKeypair] = useState({pubkey: '', secret: ''});
  const handleHexGen = () => setSeed(cryptoRandomString({length: 64}));
  const handleInputType = (event: any) => setSeed(event.target.value);
  const handleKeypairGen = (seed: string) => {
    setSeed(seed);
    setKeypair(generateKeypair(seed));
  }

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
        <input
          size={60}
          maxLength={64}
          type="text"
          value={seed}
          placeholder="e.g: Seed(Hex 64byte string)"
          onChange={handleInputType}
        />
        <button onClick={() => handleKeypairGen(seed)}>Generate</button>
        <p>pubkey: {keypair.pubkey}</p>
        <p>secret: {keypair.secret}</p>

        <div className="space" />

        <h2>Source code</h2>
        <a
          href="https://github.com/fukaoi/fukaoi.github.io/blob/feature/source/src/generateKeypair.ts#L5"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
            </a>
      </div>
    </div>
  );
}

export default App;
