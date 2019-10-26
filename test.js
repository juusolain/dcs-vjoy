var midiConnector = require('midi-launchpad').connect(1);

// wait for the connector to be ready
midiConnector.on("ready",function(launchpad) {
  console.log("Launchpad ready, let's do something");
});
