import React, { useState } from 'react';

function TestAPIPage() {
    const [result, setResult] = useState('');

    const testAPI = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/users/stats');
            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    const testRegister = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/register/veilingmeester', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gebruikersnaam: 'testfrontend' + Date.now(),
                    wachtwoord: 'password123',
                    bevestigWachtwoord: 'password123'
                })
            });
            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>API Test Page</h1>
            <div style={{ marginBottom: '20px' }}>
                <button onClick={testAPI} style={{ padding: '10px 20px', marginRight: '10px' }}>
                    Test Stats API
                </button>
                <button onClick={testRegister} style={{ padding: '10px 20px' }}>
                    Test Register API
                </button>
            </div>
            <pre style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
                {result || 'Click a button to test...'}
            </pre>
        </div>
    );
}

export default TestAPIPage;

