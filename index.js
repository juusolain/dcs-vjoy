const WebSocket = require("isomorphic-ws")
var currentMode = "none";
var selectedModifier = 0; //0 = none, 1 = left, 2 = right
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  let id = col + (row-1)*8 + 1;
  if(row == 1 && col == 0){
    if(selectedModifier == 1){
      selectedModifier == 0;
      lpadOut.setLed(1,0, [3,3]);
      lpadOut.setLed(1,1, [3,3]);
    }else{
      selectedModifier = 1;
      lpadOut.setLed(1,0, [0,3]);
      lpadOut.setLed(1,1, [3,3]);
    }
  }else if(row == 1 && col == 1){
    if(selectedModifier == 2){
      selectedModifier == 0;
      lpadOut.setLed(1,0, [3,3]);
      lpadOut.setLed(1,1, [3,3]);
    }else{
      selectedModifier = 2;
      lpadOut.setLed(1,1, [0,3]);
      lpadOut.setLed(1,0, [3,3]);
    }
  }
  console.log(id);
  if(id >= 0 && id <= 64){
    pressButton(id);
  }
})

lpadIn.on('release', (row, col)=>{
  let id = col + (row-1)*8 + 1;
  console.log(id);
  if(id >= 0 && id <= 64){
    releaseButton(id);
  }
})

rl.on('line', (input)=>{
  if(input == "fa18"){
    console.log("Set mode: "+input);
    currentMode = "fa18";
  }else if(input == "f14rio"){
    console.log("Set mode: "+input);
    currentMode = "f14rio";
  }else if(input == "f14"){
    console.log("Set mode: "+input);
    currentMode = "f14";
  }else if(input == "a10c"){
    console.log("Set mode: "+input);
    currentMode = "a10c";
    //TODO: LED_grid: take from previous version
  }else{
    console.log("Invalid mode: "+input);
  }
})

console.log("Available modes: fa18, f14rio, f14, a10c");
console.log("Select mode: ");
