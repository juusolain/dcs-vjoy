const WebSocket = require("isomorphic-ws")

ws = new WebSocket('ws://localhost:40000');
var plaunchpad = require('phi-launchpad');
var nodeMIDI = require('./node_midi_interface.js')

var midiDev = new nodeMIDI.midi();

var lpadIn = new plaunchpad.input();
lpadIn.init(midiDev);

var lpadOut = new plaunchpad.output();
lpadOut.init(midiDev);

ws.onopen = function() {
  console.log('WebSocket connection opened');
}

ws.onclose = function() {
  console.log('WebSocket connection closed')
}


function pressButton(buttonID){
  ws.send("set output "+buttonID+" 1.0");
}

function releaseButton(buttonID){
  ws.send("set output "+buttonID+" 0.0");
}

lpadIn.on('press', (row, col)=>{
  let id = col + row*8 + 1;
  console.log(id);
  pressButton(id);
})

lpadIn.on('release', (row, col)=>{
  let id = col + row*8 + 1;
  console.log(id);
  releaseButton(id);
})
