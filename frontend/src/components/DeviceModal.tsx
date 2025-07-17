import { useState } from "react";
import { useEffect, useCallback } from "react";
import axios from "axios"; // Install this with `npm install axios`

import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, ToggleButton, ToggleButtonGroup,
  Card, CardContent, Typography, CardActions, IconButton,
  Divider, TextField as MuiTextField
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

interface Device {
  _id?: string;
  name: string;
  location: string;
  status: string;
}

export default function DeviceModal() {
  const [open, setOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [alignment, setAlignment] = useState<string | null>('web');
  const [devices, setDevices] = useState<Device[]>([]);

useEffect(() => {
  axios.get('http://localhost:5000/devices')
    .then(res => setDevices(res.data))
    .catch(err => console.error(err));
}, []);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = () => {
    setDeviceName('');
    setLocation('');
    setAlignment('web');
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditIndex(null);
  };

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  const handleSaveDevice = async () => {
  if (!deviceName || !location) return;

  const newDevice: Device = {
    name: deviceName,
    location,
    status: alignment === 'web' ? 'In Lab' : 'Out of Lab',
  };

  if (editIndex !== null) {
    const id = devices[editIndex]._id; // assume backend sends `_id`
    try {
      const res = await axios.put(`http://localhost:5000/devices/${id}`, newDevice);
      const updated = [...devices];
      updated[editIndex] = res.data;
      setDevices(updated);
    } catch (err) {
      console.error(err);
    }
  } else {
    try {
      const res = await axios.post('http://localhost:5000/devices', newDevice);
      setDevices([...devices, res.data]);
    } catch (err) {
      console.error(err);
    }
  }

  setDeviceName('');
  setLocation('');
  setAlignment('web');
  setEditIndex(null);
  setOpen(false);
};


  const handleEdit = (index: number) => {
    const device = devices[index];
    setDeviceName(device.name);
    setLocation(device.location);
    setAlignment(device.status === 'In Lab' ? 'web' : 'mobile');
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index: number) => {
  const id = devices[index]._id;
  try {
    await axios.delete(`http://localhost:5000/devices/${id}`);
    setDevices(devices.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
  }
};


  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inLab = filtered.filter(d => d.status === 'In Lab');
  const outLab = filtered.filter(d => d.status === 'Out of Lab');

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = source.droppableId === 'inLab' ? inLab : outLab;
    const targetList = [...sourceList];
    const [moved] = targetList.splice(source.index, 1);
    targetList.splice(destination.index, 0, moved);

    const newDevices = [...devices.filter(d => d.status !== moved.status), ...targetList];
    setDevices(newDevices);
  };

  return (
    <div className="device-page">
    <div className="app-container">
      {/* Header */}
      <div className="header-container">
        <h2 className="header-title">Device Manager</h2>
        <Button onClick={handleOpen} color="primary" variant="contained" className="add-device-btn">Add Device</Button>
      </div>

      {/* Search */}
      <div className="search-container">
        <MuiTextField
          variant="outlined"
          label="Search by name or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </div>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editIndex !== null ? 'Edit Device' : 'Add a New Device'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Device Name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton value="web">In Lab</ToggleButton>
              <ToggleButton value="mobile">Out of Lab</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDevice} color="success" variant="contained">
            {editIndex !== null ? 'Save Changes' : 'Add'}
          </Button>
          <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Main Layout */}
      <div className="device-layout">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* In Lab Column */}
          <div className="device-column">
            <h3>In Lab</h3>
            <Droppable droppableId="inLab">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {inLab.map((device, index) => (
                    <Draggable key={`${device.name}-${index}`} draggableId={`${device.name}-${index}`} index={index}>
                      {(provided) => (
                        <Card
                          className="device-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CardContent>
                            <Typography variant="h6">{device.name}</Typography>
                            <Typography color="textSecondary">Location: {device.location}</Typography>
                            <Typography color="textSecondary">Status: {device.status}</Typography>
                          </CardContent>
                          <CardActions>
                            <IconButton color="primary" onClick={() => handleEdit(devices.indexOf(device))}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(devices.indexOf(device))}>
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Divider */}
          <div className="vertical-divider"></div>

          {/* Out of Lab Column */}
          <div className="device-column">
            <h3>Out of Lab</h3>
            <Droppable droppableId="outLab">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {outLab.map((device, index) => (
                    <Draggable key={`${device.name}-${index}`} draggableId={`${device.name}-${index}`} index={index}>
                      {(provided) => (
                        <Card
                          className="device-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CardContent>
                            <Typography variant="h6">{device.name}</Typography>
                            <Typography color="textSecondary">Location: {device.location}</Typography>
                            <Typography color="textSecondary">Status: {device.status}</Typography>
                          </CardContent>
                          <CardActions>
                            <IconButton color="primary" onClick={() => handleEdit(devices.indexOf(device))}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(devices.indexOf(device))}>
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
    </div>
  );
}
