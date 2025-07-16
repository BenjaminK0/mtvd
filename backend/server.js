const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/devices', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const deviceSchema = new mongoose.Schema({
  name: String,
  location: String,
  status: String, // "In Lab" or "Out of Lab"
});

const Device = mongoose.model('Device', deviceSchema);

// Get all devices
app.get('/devices', async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
});

// Add a new device
app.post('/devices', async (req, res) => {
  const newDevice = new Device(req.body);
  const saved = await newDevice.save();
  res.json(saved);
});

// Update a device
app.put('/devices/:id', async (req, res) => {
  const { id } = req.params;
  const updated = await Device.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
});

// Delete a device
app.delete('/devices/:id', async (req, res) => {
  const { id } = req.params;
  await Device.findByIdAndDelete(id);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
