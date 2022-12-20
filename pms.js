const https = require('https')
const crypto = require('crypto')

module.exports = handleInput // export the handleInput function

// Get the second element in the process.argv array (the first element is the path to Node.js, and the second element is the path to the script)
const input = process.argv[2]
const user_password = process.argv[3]

// handleInput.js
function handleInput(input) {
  if (input === '-h' || input === '--help') {
    showHelp()
  } else if (input === '-v' || input === '--version') {
    showVersion()
  } else if (input == '-hibp') {
    if (
      typeof user_password !== 'undefined' &&
      typeof user_password !== 'null'
    ) {
      hibp(user_password)
    } else {
      console.log('The user input by PASSWORD is empty')
    }
  } else {
    console.log('Invalid input. Use -h or --help for a list of options.')
  }
}

function showHelp() {
  console.log('Available options:')
  console.log('-h, --help: Show this help message')
  console.log('-v, --version: Show version information')
  console.log(
    '-hibp: --check if your password has been leaked or not\n \t Example: node pms.js 123abc'
  )
}

function showVersion() {
  console.log('Current version: 1.0.0')
}

//get the user input and turn it to sha1 (hash) and send to HIBP and get the output. Show user the output
function hibp(user_password) {
  //Hash the user user_password
  let hashed_password = crypto
    .createHash('sha1')
    .update(user_password)
    .digest('hex')
    .toUpperCase()

  //I only need the first 5 digits of the hash
  let first_5_digits_hashed_password = hashed_password.slice(0, 5)
  let api_call = `https://api.pwnedpasswords.com/range/${first_5_digits_hashed_password}`

  let response_all_hashes = ''
  // Yep.. This is another way to make functions :)
  https
    .get(api_call, function (res) {
      res.setEncoding('utf8')
      res.on('data', (chunk) => (response_all_hashes += chunk))
      res.on('end', onEnd)
    })
    .on('error', function (err) {
      console.log(`Error: ${err}`)
    })

  // It does't look good a function inside of another function. But I want to let the things readable here !!!
  function onEnd() {
    // Take a look on the line 53 onEnd
    let res = response_all_hashes.split('\r\n').map((h) => {
      let sp = h.split(':')
      //Hash : Number
      return {
        hash: sp[0],
        count: parseInt(sp[1]),
      }
    })
    // console.log(res);
    let found = res.find((h) => h.hash === hashed_password)
    if (found) {
      console.log(
        `Your passwords has been found ${found.count} times. \n Thi is a vulnarable password!!!`
      )
    } else {
      console.log(`Your password is safe.\n No matches found!!!`)
    }
  }
}

// Call the handleInput function with the user input
handleInput(input)
