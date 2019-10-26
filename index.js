var currentMode = "none";
var selectedModifier = 0; //0 = none, 1 = left, 2 = right

const readline = require('readline');
const Launchpad = require( 'launchpad-mini' );
const { vJoy, vJoyDevice } = require('vjoy');

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
      if ( k.pressed ) {
    // Red when button is pressed
    pad.col( pad.red, k );
} else {
    // Off when button is released
    pad.col( pad.off, k );
}
    } );
} );

if (vJoy.isEnabled()) {
console.log("vJoy enabled");
}else{
  console.log("vJoy is not enabled.");
  process.exit();
}

function pressButton(x,y){
  let buttonID=xytoID(x,y);
  device.buttons[buttonID].set(true);
  console.log("Buttonpress: "+buttonID);
}

function releaseButton(x,y){
  let buttonID=xytoID(x,y);
  device.buttons[buttonID].set(false);
  console.log("Buttonrel: "+buttonID);
}

function xytoID(x,y){
  let id=y*8+x;
  return id;
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
  if(modetext = "fa18"){
    console.log("Set mode: "+"fa18");
    currentMode = "fa18";

    for (let i = 0; i < 3; i++){
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
    lpadOut.setLed(1,1, [3,3]);
  }else if(modetext="a10c"){
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
  }else if(modetext="f14rio"){
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
  }else if(modetext="f14"){
    console.log("Set mode: "+"f14");
    currentMode = "f14";
  }else{
    console.log("Invalid mode");
  }
}

process.on('exit', (code) => {
  device.free();
});
