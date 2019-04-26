const WebSocket = require("isomorphic-ws")
var currentMode = "none";
var selectedModifier = 0; //0 = none, 1 = left, 2 = right
var modifier1 = false;
var modifier2 = false;
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

ws = new WebSocket('ws://localhost:35000');
var plaunchpad = require('phi-launchpad');
var nodeMidiInt_in = require('./node_midi_interface_in.js')
var nodeMidiInt_out = require('./node_midi_interface_out.js')


devIn = new nodeMidiInt_in.midi();
devOut = new nodeMidiInt_out.midi();

var lpadIn = new plaunchpad.input();
lpadIn.init(devIn);

var lpadOut = new plaunchpad.output();
lpadOut.init(devOut);

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
    if(modifier1){
      modifier1 = false;
      lpadOut.setLed(1,0, [3,3]);
    }else{
      modifier1 = true;
      lpadOut.setLed(1,0, [0,3]);
    }
  }else if(row == 1 && col == 1){
    if(modifier2){
      modifier2 = false;
      lpadOut.setLed(1,1, [3,3]);
    }else{
      modifier2 = true;
      lpadOut.setLed(1,1, [0,3]);
    }
  }
  if(id >= 0 && id <= 64){
    pressButton(id);
  }
})

lpadIn.on('release', (row, col)=>{
  let id = col + (row-1)*8 + 1;
  if(id >= 0 && id <= 64){
    releaseButton(id);
  }
})

rl.on('line', (input)=>{
  lpadOut.resetDevice();
  if(selectedModifier == 1){
    lpadOut.setLed(1,0, [3,0]);
    lpadOut.setLed(1,1, [3,3]);
  }else if(selectedModifier == 2){
    lpadOut.setLed(1,0, [3,3]);
    lpadOut.setLed(1,1, [3,0]);
  }else{
    lpadOut.setLed(1,1, [3,3]);
    lpadOut.setLed(1,0, [3,3]);
  }
  let splitString = input.split()
  if(splitString[0] == "press"){
    pressButton(splitString[1]);
    setTimeout(releaseButton(splitString[1]), 300);
  }
  if(input == "fa18"){
    console.log("Set mode: "+input);
    currentMode = "fa18";
    for (let i = 0; i < 5; i++){
      lpadOut.setLed(1, 2+i, [0, 3]);
    }

    for (let i = 0; i < 5; i++){
      lpadOut.setLed(2+i, 7, [0, 3]);
    }

    for (let i = 0; i < 5; i++){
      lpadOut.setLed(2+i, 1, [0, 3]);
    }

    for (let i = 0; i < 5; i++){
      lpadOut.setLed(7, 2+i, [0, 3]);
    }

    for (let i = 0; i < 3; i++){
      lpadOut.setLed(2+i, 3, [3, 3]);
      lpadOut.setLed(2+i, 4, [3, 3]);
      lpadOut.setLed(2+i, 5, [3, 3]);
    }

    lpadOut.setLed(5, 4, [3, 3]);
    lpadOut.setLed(5, 3, [3, 0]);
    lpadOut.setLed(5, 5, [0, 3]);
    for (let i = 0; i < 5; i++){
      lpadOut.setLed(2+i, 6, [3, 0]);
    }

    for (let i = 0; i < 6; i++){
      lpadOut.setLed(8, 0+i, [3, 3]);
    }

    lpadOut.setLed(8, 6, [3, 0]);
    lpadOut.setLed(7, 0, [3, 1]);
    lpadOut.setLed(7, 7, [3, 1]);
    lpadOut.setLed(1,0, [3,3]);
    lpadOut.setLed(1,1, [3,3]);
  }else if(input == "f14rio"){

    console.log("Set mode: "+input);
    currentMode = "f14rio";
    for(let i = 0; i<4; i++){
      lpadOut.setLed(3+i, 7, [0, 3]);
    }
    for(let i = 0; i<3; i++){
      lpadOut.setLed(8, 5+i, [0, 3]);
    }
    for(let i = 0; i<3; i++){
      lpadOut.setLed(8, 5+i, [0, 3]);
    }
    for(let i = 0; i<2; i++){
      lpadOut.setLed(7, 5+i, [0, 3]);
    }
    for(let i = 0; i<2; i++){
      lpadOut.setLed(7, 3+i, [3, 3]);
    }
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
