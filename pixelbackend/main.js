const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000; // Use a different port than the frontend
app.use(express.json());

app.use(cors());
// Allow requests from specific origins
//app.use(cors({ origin: 'http://localhost:5173' }));

// Example route
app.get("/", (req, res) => {
  res.send("New backend server is running!");
});
const pixelstates = {};
// Endpoint to handle pixel submission
app.post("/pixels/submit", (req, res) => {
  const { currentUserID, changes } = req.body;

  // Validate input
  if (!currentUserID || !Array.isArray(changes)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Ensure the userID exists in pixelstates
  if (!pixelstates[currentUserID]) {
    pixelstates[currentUserID] = [];
  }

  // Add the changes to the user's pixel data
  changes.forEach((change) => {
    pixelstates[currentUserID].push({
      xCoordinate: change.xCoordinate,
      yCoordinate: change.yCoordinate,
      color: change.color,
      timestamp: new Date(change.timestamp), // Ensure timestamp is a Date object
    });
  });

  // Respond with a success message
  res.status(200).json({ message: "Pixels submitted successfully!" });
});

// Endpoint to get pixel data for debugging or visualization
app.get("/pixels", (req, res) => {
  res.status(200).json(pixelstates);
});
// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
