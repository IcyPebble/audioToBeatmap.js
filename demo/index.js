const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(__dirname));

// index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// open app
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
