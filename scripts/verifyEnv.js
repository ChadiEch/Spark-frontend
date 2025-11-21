// Verify frontend environment variables
console.log('=== FRONTEND ENVIRONMENT VARIABLES VERIFICATION ===');

// Check if we're in a browser environment or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Running in browser environment');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Expected VITE_API_URL: https://spark-backend-production.up.railway.app/api');
  
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  const redirectUri = `${backendUrl}/api/integrations/callback`;
  console.log('Generated redirect URI:', redirectUri);
  console.log('Expected redirect URI: https://spark-backend-production.up.railway.app/api/integrations/callback');
  console.log('Match:', redirectUri === 'https://spark-backend-production.up.railway.app/api/integrations/callback');
} else {
  // Node.js environment
  console.log('Running in Node.js environment');
  console.log('This script is meant to be run in the browser to check frontend environment variables');
  console.log('');
  console.log('To check your frontend .env file, look for these values:');
  console.log('VITE_API_URL=https://spark-backend-production.up.railway.app/api');
  console.log('');
  console.log('This should generate a redirect URI of:');
  console.log('https://spark-backend-production.up.railway.app/api/integrations/callback');
}