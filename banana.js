const https = require('https');
const crypto = require('crypto');


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

  // it doesnt look good 
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


hibp("balademorango");
