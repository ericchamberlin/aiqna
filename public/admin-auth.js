async function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    // Simple password check without hashing for now
    if (password === 'LaN3ig32025!') {
        sessionStorage.setItem('adminAuthenticated', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('Invalid password');
    }
    return false;
}