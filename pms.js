const https = require('https');
const crypto = require('crypto');


// handleInput.js
function handleInput(input) {
  if (input === "-h" || input === "--help") {
    showHelp();
  } else if (input === "-v" || input === "--version") {
    showVersion();
  } else if (input == "-hibp") {
    hibp(input);
  } else {
    console.log("Invalid input. Use -h or --help for a list of options.");
  }
}

function showHelp() {
  console.log("Available options:");
  console.log("-h, --help: Show this help message");
  console.log("-v, --version: Show version information");
  console.log("-hibp: --check if your password has been leaked or not\n ex: node pms.js 123abc");
}

function showVersion() {
  console.log("Current version: 1.0.0");
}



//get the user input and turn it to sha1 (hash) and send to HIBP and get the output. Show user the output 
function hibp(user_password) {
  let hashed_password = crypto.createHash('sha1')
    .update(user_password)
    .digest('hex')
    .toUpperCase();

  // we ONLY need the first 5 chars
  let first_5_digits_hashed_password = hashed_password.slice(0, 5);
  let api_call = `https://api.pwnedpasswords.com/range/${first_5_digits_hashed_password}`;


  let response_all_hashes = '';

  https.get(api_call, function(res) {
    res.setEncoding('utf8');
    res.on('data', (chunk) => response_all_hashes += chunk);
    res.on('end', onEnd);
  }).on('error', function(err) {
    console.log(`Error: ${err}`);
  });

  // it doesnt look good. But this is the best way to do it (a function inside another function) 
  function onEnd() {
    // Look at the line 22 
    let res = response_all_hashes.split('\r\n').map((h) => {
      let sp = h.split(':');
      //HASH : NUMBER
      return {
        hash: sp[0],
        count: parseInt(sp[1])
      }
    });
    console.log(res);
  }

}

module.exports = handleInput; // export the handleInput function

// index.js
const handleInput = require("./handleInput"); // import the handleInput function

// Get the second element in the process.argv array (the first element is the path to Node.js, and the second element is the path to the script)
const input = process.argv[2];

// Call the handleInput function with the user input
handleInput(input);

