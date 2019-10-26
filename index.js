var currentMode = "none";
var selectedModifier = 0; //0 = none, 1 = left, 2 = right
var currentPage = 1;
const readline = require('readline');
const parse = require('csv-parse')
const fs = require("fs");
const Launchpad = require( 'launchpad-mini' );
const { vJoy, vJoyDevice } = require('vjoy');

var pages = new Map();

fs.readdir("pages/", function(err, filenames) {
  filenames.forEach(function(filename) {
    if(filename.endsWith(".csv")){
      fs.readFile("pages/" + filename, 'utf-8', function(err, content) {
        if (!err) {
            var pageMap = new Map();
            var rows = content.split(/\r?\n/);
            console.log(rows);
            for (var i = 0; i < 8; i++) {
              var values = rows[i].split(";");
              for (var j = 0; j < 8; j++) {
                pageMap.set(xytoID(j, i), values[j]);
              }
            }
            pages.set(filename.split(".")[0], pageMap);
            console.log(pageMap);
        }else{
          console.log(err);
        }
      });
    }
  });
});

var device = vJoyDevice.create(1);

pad = new Launchpad();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

if (vJoy.isEnabled()) {
console.log("vJoy enabled");
}else{
  console.log("vJoy is not enabled.");
  process.exit();
}

function pressButton(x,y){
  let buttonID=xytoID(x,y);
  console.log("Buttonpress: "+buttonID);
  if(buttonID === 1){
    setPage(1);
  }else if(buttonID === 2){
    setPage(2);
  }else{
    buttonID = buttonID + (currentPage*64);
    console.log("Button_page: "+buttonID);
    device.buttons[buttonID].set(true);
  }
}

function releaseButton(x,y){
  let buttonID=xytoID(x,y);
  console.log("Buttonrel: "+buttonID);
  if(buttonID !== 1 && buttonID !== 2){
    buttonID = buttonID + (currentPage*64);
    console.log("Button_page: "+buttonID);
    device.buttons[buttonID].set(false);
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
    console.log("Rendering singles: "+mapname)
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

function render(mode, page){
  let mapname = mode+"_"+page;
  console.log("Rendering: "+mapname)
  if(pages.get(mapname)){
    pad.reset(0);
    for (let item of pages.get(mapname)) {
      let loc = IDtoxy(item[0]);
      console.log(loc);
      let col = item[1];
      let lcolor;
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
    pad.col(pad.green, [page-1,0]);
  }else{
    pad.reset(0);
    pad.col(pad.green, [page-1,0]);
  }
}

function setPage(page){
  currentPage = page;
  render(currentMode, page);
}

rl.on('line', (input)=>{
  let splitString = input.split(" ");
  console.log(splitString);
  if(splitString[0] == "press"){
    console.log("Pressing button: "+splitString[1]);
    pressButton(splitString[1]);
    setTimeout(()=>{
      releaseButton(splitString[1]);
    }, 30);
  }
  setMode(input);
})

console.log("Available modes: fa18, f14rio, f14, a10c");
console.log("Select mode: ");

function setMode(modetext){
  if(modetext == "fa18"){
    console.log("Set mode: "+"fa18");
    currentMode = "fa18";
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
    currentMode = "a10c";
  }else if(modetext=="f14rio"){
    console.log("Set mode: "+"f14rio");
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
    lpadOut.setLed(6, 6, [3,3]);
    for (let i = 0; i < 6; i++){
    }
  }else if(modetext=="f14"){
    console.log("Set mode: "+"f14");
    currentMode = "f14";
  }else{
    console.log("Evaling: "+modetext);
    eval(modetext); //DANGEROUS!!
    console.log("Invalid mode");
  }
  render(currentMode, currentPage);
}

process.on('exit', (code) => {
  device.free();
  pad.disconnect();
  console.log("Exiting");
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit(0);
});
