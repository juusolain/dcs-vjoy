const { spawn } = require('child_process');
const { exec } = require('child_process');
var childProcess;
var main;

childProcess = exec("E:\\Projects\\dcs-vjoy\\Feeder\\vJoySerialFeeder.exe", (err, stdout, stdin)=>{
  console.log(err);
  console.log(stdout);
  console.log(stdin);
})

setTimeout(()=>{
  main = require("./main.js");
}, 2000);
