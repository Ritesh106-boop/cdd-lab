// app.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from CI/CD Lab App!');
});

app.get('/items', (req, res) => {
  res.json([{ id: 1, name: 'apple' }]);
});

module.exports = app; // exported for tests

if (require.main === module) {
  app.listen(port, () => console.log(`App running at http://localhost:${port}`));
}
