const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('public'));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(port) {
    app.listen(port)
        .on('listening', () => {
            console.log(`Server is running on port ${port}`);
        })
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}`);
                startServer(port + 1);
            } else {
                console.error('Server error:', err);
            }
        });
}

startServer(3000);