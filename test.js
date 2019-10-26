const Launchpad = require( 'launchpad-mini' ),
      pad = new Launchpad();

pad.connect(0,0).then( () => {     // Auto-detect Launchpad
    pad.reset( 2 );             // Make Launchpad glow yellow
    console.log("Conencted");
    pad.on( 'key', k => {
        // Make button red while pressed, green after pressing
        console.log(k);
        pad.col( k.pressed ? pad.red : pad.green, k );
    } );
} );

process.on('exit', (code) => {
  console.log("Exiting");
  pad.disconnect();
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit(0);
});
