const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const { exec } = require('child_process');


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

// Endpoint to return the contents of the JSON file
app.get('/get-token', (req, res) => {
  const filePath = path.join(__dirname, 'json/tokendata.json'); // Adjust the path to your JSON file

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


// Endpoint to return the contents of the JSON file
app.get('/get-address', (req, res) => {
  const filePath = path.join(__dirname, 'json/address.json'); // Adjust the path to your JSON file

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



app.post('/updateAction', (req, res) => {
  const { address, action } = req.body;

  if (!address || !action) {
    return res.status(400).send('Address and action are required.');
  }

  const filePath = path.join(__dirname, 'json/address.json'); // Adjust the path to your JSON file

  // Read the existing data from address.json
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file.');
    }

    let addressData = {};

    // If the file is not empty, parse the data
    if (data) {
      addressData = JSON.parse(data);
    }

    // Check if the address exists in the file
    if (!addressData[address]) {
      // If not, create a new object for the address
      addressData[address] = {
        water: 0,
        light: 0,
        music: 0
      };
    }

    // Increment the appropriate action count
    if (addressData[address][action] !== undefined) {
      addressData[address][action]++;
    } else {
      return res.status(400).send('Invalid action.');
    }

    // Write the updated data back to the file
    fs.writeFile(filePath, JSON.stringify(addressData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).send('Error writing file.');
      }
      res.status(200).send('Action updated successfully.');
    });
  });
});

app.get('/trigger-pump', async (req, res) => {
  try {
    const response = await fetch('http://100.85.115.44:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=pump',
    });

    const data = await response.text();
    res.send(`Pump action triggered: ${data}`);
  } catch (error) {
    console.error('Error triggering pump:', error);
    res.status(500).send('Failed to trigger pump action');
  }
});

app.get('/trigger-light', async (req, res) => {
  try {
    const response = await fetch('http://100.85.115.44:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=light',
    });

    const data = await response.text();
    res.send(`Pump action triggered: ${data}`);
  } catch (error) {
    console.error('Error triggering pump:', error);
    res.status(500).send('Failed to trigger pump action');
  }
});

app.get('/trigger-music', async (req, res) => {
  try {
    const response = await fetch('http://100.85.115.44:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=music',
    });

    const data = await response.text();
    res.send(`water action triggered: ${data}`);
  } catch (error) {
    console.error('Error triggering water:', error);
    res.status(500).send('Failed to trigger water action');
  }
});

// Serve static files from the Vue app's 'dist' directory


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
