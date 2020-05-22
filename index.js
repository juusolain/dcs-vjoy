/*
CSV FORMAT:
COLORS:
r: color red
g: color green
a: color amber

STATIC COLOR:
Cell is color

TOGGLE SWITCH DCS:
b_BIOSADDRESS, v:c, ...: when BIOSADDRESS value is v, set color to c
example:
b_

*/

class ButtonPressEmitter{
  constructor(){
    this.handlers = []
  }
  
  on = function (num, handler) {
    this.handlers[num] = handler
  }
  
  reset = function () {
    this.handlers = []
  }
  
  press = function(num){
    const handler = this.handlers[num]
    if(handler){
      handler(1)
    }
  }
  
  release = function(num){
    const handler = this.handlers[num]
    if(handler){
      handler(0)
    }
  }
}


var selectedModifier = 0; //0 = none, 1 = left, 2 = right
var currentPage = 1;
var currentAircraft = null;
const readline = require('readline');
const parse = require('csv-parse')
const fs = require("fs");
const Launchpad = require( 'launchpad-mini' );
const DcsBiosApi = require('dcs-bios-api');



var api = new DcsBiosApi({ logLevel: 'INFO', emitAllUpdates: true });
var buttonPress = new ButtonPressEmitter()

var configs = new Map();

var currentEvents = [];

var currentColors = [];

var refreshInterval = setInterval(()=>{
  renderFromMemory();
}, 200);


fs.readdir("configs/", function(err, filenames) {
  filenames.forEach(function(filename) {
    if(filename.endsWith(".json")){
      fs.readFile("configs/" + filename, 'utf-8', function(err, content) {
        if (!err) {
          var config = JSON.parse(content)
          configs.set(filename.split(".")[0], config);
        }else{
          console.log(err);
        }
      });
    }
  });
});

pad = new Launchpad();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


api.on('_ACFT_NAME', (value) => {
  let properValue = value.replace(/\0.*$/g,'');
  if(currentAircraft != properValue){
    currentAircraft = properValue;
    let array = api.eventNames();
    array.forEach((elem)=>{
      if(elem != "_ACFT_NAME"){
        api.removeAllListeners(elem);
      }
    })
    loadACFT();
  }
});


function getColorFromCode(colorCode){
  switch(colorCode){
    case 'red':
    return pad.red;
    case 'green':
    return pad.green;
    case 'amber':
    return pad.amber;
    case 'off':
    return pad.off;
    default:
    return pad.off;
  }
}

function getBiosHandler(equalTo, then){
  return function (value){
    if(value === equalTo){
      then()
    }
  } 
}

function setColor(id, newColor){
  currentColors[id] = newColor
}

function loadACFT(){
  currentEvents.forEach((item)=>{
    clearInterval(item.func);
  });
  const config = configs.get(currentAircraft)
  if(config){
    for (const item in config.keys) {
      const id = item.id
      for (const color of item.colors){
        const val = color.value
        const prop = color.prop
        const color = getColorFromCode(color.color)
        
        const handler = getBiosHandler(val, setColor(id))
        api.on(prop, handler)
      }
      const action = item.action
      const defaultcolor = item.defaultcolor
      if(action){
        const handler = function (type){
          if(type === 1){
            api.sendMessage(`${action.prop} ${action.value}`)
          }
        }
        buttonPress.on(id, handler)
      }

      if(defaultcolor){
        const color = getColorFromCode(defaultcolor)
        setColor(id, color)
      }
    }
  }
}

pad.connect(0,1).then( () => {     // Auto-detect Launchpad
  console.log("Launchpad connected");
  pad.reset(2);             // Make Launchpad glow yellow
  pad.on( 'key', k => {
    if(k.pressed){
      pressButton(k.x, k.y);
    }else{
      releaseButton(k.x, k.y);
    }
  });
} );


function pressButton(x,y){
  let buttonID=xytoID(x,y);
  if(buttonID === 1){
    setPage(currentPage-1);
  }else if(buttonID === 2){
    setPage(currentPage+1);
  }else{
    buttonID = buttonID + ((currentPage-1)*64);
    buttonPress.press(buttonID)
  }
}


function releaseButton(x,y){
  let buttonID=xytoID(x,y);
  if(buttonID !== 1 && buttonID !== 2){
    buttonID = buttonID + ((currentPage-1)*64);
    buttonPress.release(buttonID)
  }
}

function xytoID(x,y){
  let id=y*8+x+1;
  return id;
}

function IDtoxy(id){
  let x = (id-1)%8;
  let y = (id-1-x)/8;
  let returnVal = [x, y];
  return returnVal;
}

function renderSingle(loc, mode, page){
  let mapname = mode+"_"+page;
  console.log("Rendering single: "+mapname)
  if(pages.get(mapname)){
    pad.reset(0);
    col = pages.get(mapname).get(xytoID(loc[0], loc[1]));
    if(col == "r"){
      pad.col(pad.red, loc);
    }else if(col == "g"){
      pad.col(pad.green, loc);
    }else if(col == "a"){
      pad.col(pad.amber, loc);
    }else if(col == undefined || col == ""){
      pad.col(pad.off, loc);
    }
  }
}

function renderFromMemory(){
  var pageID = (currentPage-1)*64
  for (var i = pageID; i < currentPage*64+1; i++) {
    if(currentColors[i]){
      pad.col(currentColors[i], IDtoxy(i-pageID));
    }else{
      pad.col(pad.off, IDtoxy(i-pageID));
    }
  }
}

function setPage(page){
  if(page > 0 && page < 4){
    currentPage = page;
  }
}

rl.on('line', (input)=>{
  let splitString = input.split(" ");
  if(splitString[0] == "press"){
    console.log("Pressing button: "+splitString[1]);
    pressButton(splitString[1]);
    setTimeout(()=>{
      releaseButton(splitString[1]);
    }, 30);
  }else{
    eval(input);
  }
})

console.log("Available modes: fa18, f14rio, f14, a10c");
console.log("Select mode: ");

function setMode(modetext){
  if(modetext == "fa18"){
    console.log("Set mode: "+"fa18");
    currentAircraft = "fa18";
    currentPage = 1;
    
    /*for (let i = 0; i < 3; i++){
      lpadOut.setLed(2+i, 3, [3, 3]);
      lpadOut.setLed(2+i, 4, [3, 3]);
      lpadOut.setLed(2+i, 5, [3, 3]);
    }
    lpadOut.setLed(5, 4, [3, 3]);
    lpadOut.setLed(5, 3, [3, 1]);
    lpadOut.setLed(5, 5, [1, 3]);
    for (let i = 0; i < 5; i++){
      lpadOut.setLed(2+i, 6, [0, 3]);
    }
    for (let i = 0; i < 6; i++){
      lpadOut.setLed(8, 0+i, [3, 3]);
    }
    lpadOut.setLed(8, 6, [3, 0]);
    
    
    lpadOut.setLed(7, 0, [0, 3]);
    lpadOut.setLed(7, 7, [0, 3]);
    
    lpadOut.setLed(6, 0, [3, 1]);
    lpadOut.setLed(6, 7, [3, 1]);
    
    lpadOut.setLed(5, 0, [1, 3]);
    lpadOut.setLed(5, 7, [1, 3]);
    
    lpadOut.setLed(1,0, [3,3]);
    lpadOut.setLed(1,1, [3,3]);*/
  }else if(modetext=="a10c"){
    for(let i = 0; i < 3; i++){
      lpadOut.setLed(6, 0+i, [3,2]);
      lpadOut.setLed(7, 0+i, [3,2]);
      lpadOut.setLed(8, 0+i, [3,2]);
      
    }
    lpadOut.setLed(6, 4, [2,3]);
    lpadOut.setLed(7, 4, [2,3]);
    lpadOut.setLed(8, 4, [3,0]);
    lpadOut.setLed(7,3,[3,2]);
    lpadOut.setLed(6,3,[2,3]);
    lpadOut.setLed(8,3,[2,3]);
    
    lpadOut.setLed(6, 5, [0,3]);
    lpadOut.setLed(7, 5, [2,3]);
    lpadOut.setLed(8, 5, [2,3]);
    
    console.log("Set mode: "+"a10c");
    currentAircraft = "a10c";
  }else if(modetext=="f14rio"){
    console.log("Set mode: "+"f14rio");
    currentAircraft = "f14rio";
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
    lpadOut.setLed(6, 6, [3,3]);
    for (let i = 0; i < 6; i++){
    }
  }else if(modetext=="f14"){
    console.log("Set mode: "+"f14");
    currentAircraft = "f14";
  }
  render(currentAircraft, currentPage);
}

process.on('exit', (code) => {
  device.free();
  device2.free();
  pad.disconnect();
  console.log("Exiting");
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit(0);
});
