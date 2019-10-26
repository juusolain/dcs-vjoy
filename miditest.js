const midi = require('midi');

// Set up a new output.
const output = new midi.output();

// Count the available output ports.
console.log(output.getPortCount());

// Get the name of a specified output port.
console.log(output.getPortName(1));

// Set up a new output.
const input = new midi.input();

// Count the available output ports.
console.log(input.getPortCount());

// Get the name of a specified output port.
console.log(input.getPortName(0));
