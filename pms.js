const https = require('https') // To make the resquest to HIBP
const CryptoJS = require('crypto-js') // We need the crypto-js library to compute the SHA-1 hash

// module.exports = async handleInput;

// Get the second element in the process.argv array (the first element is the path to Node.js, and the second element is the path to the script)
const input = process.argv[2]
const user_password = process.argv[3]

async function handleInput(input) {
  if (input === '-h' || input === '--help') {
    showHelp();
  } else if (input === '-v' || input === '--version') {
    showVersion();
  } else if (input == '-hibp') {
    if (
      typeof user_password !== 'undefined' &&
      typeof user_password !== 'null'
    ) {
      const result = await hibp(user_password);
      console.log(result);
    }
  } else {
    console.log('Invalid input. Use -h or --help for a list of options.');
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

// Get the user input and turn it to sha1 (hash) and send to HIBP and get the output. Show user the output
function hibp(password) {
  return new Promise((resolve, reject) => {
    // We return a Promise to handle the async nature of the API request
    const hash = CryptoJS.SHA1(password).toString() // We hash the password using the SHA-1 algorithm
    const options = {
      hostname: 'api.pwnedpasswords.com',
      path: `/range/${hash.substring(0, 5)}`, // We only need the first 5 characters of the hash for the API request
      headers: {
        'User-Agent': 'MyApp/1.0.0', // We need to set a User-Agent header to make the request
      },
    }

    https
      .get(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        }) // We append each chunk of data to a string
        res.on('end', () => {
          const lines = data.split('\n') // The API returns the hash suffixes and number of occurrences on separate lines
          for (const line of lines) {
            const [suffix, count] = line.split(':') // We split each line by the colon separator
            if (hash.substring(5).toUpperCase() === suffix.toUpperCase()) {
              // If the suffix matches the remaining characters of the hash, the password has been leaked
              resolve(
                'This password has been found ${count} times in data breaches.'
              )
              return
            }
          }
          resolve('This password has not been found in any data breaches.') // If we didn't find a match, the password has not been leaked
        })
      })
      .on('error', (e) => {
        reject(e) // If there was an error making the request, we reject the Promise with the error
      })
  })
}

// Call the handleInput function with the user input
handleInput(input)
