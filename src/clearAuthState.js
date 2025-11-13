// This script clears all authentication-related data from localStorage and sessionStorage
// Run this in the browser console or include it in a page to reset authentication state

console.log('Clearing authentication data...');

// Clear localStorage items
const authKeys = ['token', 'refreshToken', 'winnerforce_current_user', 'rememberMe'];
authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`Removed ${key} from localStorage`);
  }
});

// Clear all sessionStorage
if (sessionStorage.length > 0) {
  sessionStorage.clear();
  console.log('Cleared sessionStorage');
}

// Clear any cookies that might be related to authentication
// Note: We can only clear cookies that were set via JavaScript
console.log('Authentication data cleared. You can now try logging in again.');

// Optional: Reload the page to ensure clean state
// window.location.reload();