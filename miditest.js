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

// Configure a callback.
input.on('message', (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  console.log(`m: ${message} d: ${deltaTime}`);
});

// Open the first available input port.
input.openPort(0);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use
// input.ignoreTypes(true, false, true)
input.ignoreTypes(false, false, false);
