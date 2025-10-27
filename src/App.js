import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Time wasted:{' '}
                    <span id="time-wasted">
            {minutes > 0
                ? `${minutes} minuut${minutes > 1 ? 'en' : ''} en ${remainingSeconds} seconde${remainingSeconds !== 1 ? 'n' : ''}`
                : `${remainingSeconds} seconde${remainingSeconds !== 1 ? 'n' : ''}`}
          </span>
                </p>
                <a
                    style={{ textDecoration: 'none', color: 'white' }}
                    className="App-link"
                    href="https://google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Zoek het zelf uit!
                </a>
            </header>
        </div>
    );
}

export default App;
