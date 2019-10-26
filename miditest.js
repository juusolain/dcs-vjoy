const midi = require('midi');

// Set up a new output.
const output = new midi.output();

// Count the available output ports.
output.getPortCount();

// Get the name of a specified output port.
output.getPortName(0);

// Set up a new output.
const input = new midi.input();

// Count the available output ports.
input.getPortCount();

// Get the name of a specified output port.
input.getPortName(0);
