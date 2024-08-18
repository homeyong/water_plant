const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');


app.use(cors());
app.use(express.json());

// Handle all routes to return the Vue app's index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/dist/index.html'));
// });

app.post('/api/chat', (req, res) => {
  const filePath = path.join(__dirname, 'chat_logs', `${new Date().toISOString().split('T')[0]}.txt`);
  const { content, timestamp, userId } = req.body;
  const message = `${timestamp}: ${userId}: ${content}\n`;

  // Append the message to the daily text file
  fs.appendFile(filePath, message, (err) => {
    if (err) {
      console.error('Failed to write message to file:', err);
      return res.status(500).json({ error: 'Failed to store message' });
    }
    res.status(200).json({ success: true });
  });
});

// Endpoint to return the contents of the JSON file
app.get('/get-idl', (req, res) => {
  const filePath = path.join(__dirname, 'json/idl.json'); // Adjust the path to your JSON file

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the JSON file:', err);
      return res.status(500).json({ error: 'Failed to read the JSON file' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing the JSON file:', parseErr);
      res.status(500).json({ error: 'Failed to parse the JSON file' });
    }
  });
});

// Endpoint to retrieve chat messages
app.get('/api/chat', (req, res) => {
  const filePath = path.join(__dirname, 'chat_logs', `${new Date().toISOString().split('T')[0]}.txt`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read messages from file:', err);
      return res.status(500).json({ error: 'Failed to load messages' });
    }
    const messages = data.split('\n').filter(Boolean).map(line => {
      const [timestamp, userId, ...contentArr] = line.split(': ');
      return {
        timestamp,
        userId,
        content: contentArr.join(': ')
      };
    });
    res.json(messages);
  });
});


// Serve static files from the Vue app's 'dist' directory


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
