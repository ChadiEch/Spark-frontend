import { useState, useEffect } from 'react';

export default function ApiTest() {
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        // Clear any existing auth data first
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('winnerforce_current_user');
        
        console.log('Testing API connection...');
        
        // Test the health endpoint
        const response = await fetch('http://localhost:5001/api/health');
        const data = await response.json();
        
        if (data.success) {
          setStatus('✅ API Connection Successful');
        } else {
          setStatus('❌ API Connection Failed');
          setError('API returned unsuccessful response');
        }
      } catch (err: any) {
        console.error('API Test Error:', err);
        setStatus('❌ API Connection Failed');
        setError(err.message || 'Unknown error occurred');
      }
    };

    testApiConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>API Connection Test</h1>
      <p><strong>Status:</strong> {status}</p>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <h2>Next Steps:</h2>
        <ol>
          <li>Make sure both frontend (port 8080) and backend (port 5001) servers are running</li>
          <li>Try logging in with credentials:
            <ul>
              <li>Email: chadi@winnerforce.com</li>
              <li>Password: 123456</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}