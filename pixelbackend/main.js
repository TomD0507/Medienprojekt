const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000; // Use a different port than the frontend

// Middleware to parse JSON
app.use(express.json());

// Allow requests from all origins
app.use(cors());
// Allow requests from specific origins
//app.use(cors({ origin: 'http://localhost:5173' }));

// Example route
app.get("/", (req, res) => {
  res.send("New backend server is running!");
});
app.get("/pixels/get", (req, res) => {
  res.send("New backend server is running!");
});
app.get("/pixels/submit", (req, res) => {
  res.send("New backend server is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
