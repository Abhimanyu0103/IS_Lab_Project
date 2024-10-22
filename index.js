// Required modules
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public'

// In-memory storage for messages (for simplicity)
const messages = [];

// Your encryption key and IV (initialization vector)
// NOTE: These should be securely stored and managed in a production environment.
const encryptionKey = crypto.randomBytes(32); // Example key (AES-256) - should be fixed
const iv = crypto.randomBytes(16); // Example IV - should be fixed

// Function to encrypt the message using AES
function encryptMessage(message) {
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Function to decrypt the message using AES
function decryptMessage(encryptedMessage) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
  let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Route to send an encrypted message
app.post("/sendMessage", (req, res) => {
  const { message, recipient, expiryMinutes = 10 } = req.body;
  const encryptedMessage = encryptMessage(message);

  const createdAt = new Date();
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60 * 1000);

  // Convert expiry time to IST
  const options = {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const expiryTimeIST = expiryTime.toLocaleString("en-IN", options);

  // Store the message in memory
  const messageData = {
    id: messages.length + 1,
    message: encryptedMessage,
    recipient,
    createdAt,
    expiryTime,
  };

  messages.push(messageData);

  res.status(200).json({
    success: true,
    message: "Message sent successfully",
    expiryTime: expiryTimeIST,
    encryptedMessage: encryptedMessage,
  });
});

// Route to decrypt a message
app.post("/decryptMessage", (req, res) => {
  const { encryptedMessage } = req.body; // Get the encrypted message from the request body

  if (!encryptedMessage) {
    return res
      .status(400)
      .json({ success: false, message: "No encrypted message provided." });
  }

  try {
    const decryptedMessage = decryptMessage(encryptedMessage); // Decrypt the message
    return res.status(200).json({ success: true, decryptedMessage }); // Return the decrypted message
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Decryption failed." }); // Handle decryption errors
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Route to get all messages
app.get("/getMessages", (req, res) => {
  // Return all messages stored in memory
  res.status(200).json({ messages });
});
