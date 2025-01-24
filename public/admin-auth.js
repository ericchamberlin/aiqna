async function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    // Hash the password before comparing (using SHA-256)
    const hashedPassword = await crypto.subtle.digest(
        'LaN3ig32025!',
        new TextEncoder().encode(password)
    );
    
    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashedPassword));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare with your stored hash
    if (password === 'LaN3ig32025!') {  // For now, direct comparison
        sessionStorage.setItem('adminAuthenticated', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('Invalid password');
    }
    return false;
}