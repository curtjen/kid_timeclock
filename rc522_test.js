var cmd = require("node-cmd");

var test;

cmd.get(
    'sudo python vendor/MFRC522/Read.py',
    function(err, data, stderr) {
        test = data;
    }
);

console.log('test: ', test);
