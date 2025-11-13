// Clear all localStorage items related to authentication
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
localStorage.removeItem('winnerforce_current_user');
localStorage.removeItem('rememberMe');

console.log('Cleared authentication data from localStorage');

// Also clear any sessionStorage
sessionStorage.clear();
console.log('Cleared sessionStorage');

// Reload the page to start fresh
// window.location.reload();