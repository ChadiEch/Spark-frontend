// Script to check frontend environment configuration
console.log('=== FRONTEND ENVIRONMENT CONFIGURATION ===\n');

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
  console.log('To manually check your frontend .env files:');
  console.log('');
  console.log('Development (.env):');
  console.log('VITE_API_URL=http://localhost:5001/api');
  console.log('');
  console.log('Production (.env.production):');
  console.log('VITE_API_URL=https://spark-backend-production.up.railway.app/api');
  console.log('');
  console.log('Both should generate redirect URIs that match what\'s in your database and Google Console.');
}