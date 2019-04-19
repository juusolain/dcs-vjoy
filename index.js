ws = new WebSocket('ws://localhost:40000');
var plaunchpad = require('phi-launchpad');
var nodeMIDI = require('node_midi_interface.js')

var midiDev = new dummyMIDI.midi():

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


function pressButton(lpID){
  let buttonID = lpIDtoNum(lpID);
  ws.send("set output "+buttonID+" 1.0");
}

function releaseButton(lpID){
  let buttonID = lpIDtoNum(lpID);
  ws.send("set output "+buttonID+" 0.0");
}

function lpIDtoNum(lpID){
  if(lpID < 8){
    return lpID;
  }
}
