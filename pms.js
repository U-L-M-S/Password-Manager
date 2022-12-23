const https = require('https') // To make the resquest to HIBP
const CryptoJS = require('crypto-js') // We need the crypto-js library to compute the SHA-1 hash
const crypto = require('crypto') // We need it to create a SAFE random number

// Get the second element in the process.argv array (the first element is the path to Node.js, and the second element is the path to the script)
const input = process.argv[2]
const input2 = process.argv[3]
const input3 = process.argv[4]

async function handleInput(input) {
  if (input === '-h' || input === '--help') {
    showHelp()
  } else if (input === '-v' || input === '--version') {
    showVersion()
  } else if (input === '-hibp' || input === '--have-i-been-pwned') {
    if (input2 !== undefined && input2 !== null) {
      hibp(input2)
    }
  } else if (input === '-cp' || input === '--create-password') {
    if (validateInput(input2) === true) {
      const result_cp = createPassword(input2)
      console.log(result_cp)
    }
  } else {
    console.log('Invalid input. Use -h or --help for a list of options.')
  }
}

// Check if the user insected any character other than 'b', 's', 'c' (digits will be ignored)
function validateInput(input) {
  // Check if input contains any character other than 'b', 's', or 'c'
  let invalidChars = input.match(/[^bscd\d]/g)

  // If invalidChars is not null, return false
  if (invalidChars) {
    return false
  }

  // Otherwise, return true
  return true
}

function showHelp() {
  console.log('Available options:')
  console.log('-h, --help: Show this help message')
  console.log('-v, --version: Show version information')
  console.log(
    '-hibp, --have-i-been-pwned: Check if your password has been leaked or not\n \t EX: node pms.js 123abc'
  )
  console.log(
    '-cp, --create-password: Create a randon password. Syntax:\n \t \t <number> length\n \t \t b big letters\n \t \t s small letters\n \t \t c characters\n \t d digits \n \t EX: -cp 12bc -> it creates a password with a length of 12 + big letters + characters'
  )
}

function showVersion() {
  console.log('Current version: 1.0.0')
}

// Get the user input and turn it to sha1 (hash) and send to HIBP and get the output. Show user the output
function hibp(password) {
  let hashedPassword = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex')
    .toUpperCase()
  let prefix = hashedPassword.slice(0, 5)
  let apiCall = `https://api.pwnedpasswords.com/range/${prefix}`

  let hashes = ''
  https
    .get(apiCall, function (res) {
      res.setEncoding('utf8')
      res.on('data', (chunk) => (hashes += chunk))
      res.on('end', onEnd)
    })
    .on('error', function (err) {
      console.error(`Error: ${err}`)
    })

  function onEnd() {
    let res = hashes.split('\r\n').map((h) => {
      let sp = h.split(':')
      return {
        hash: prefix + sp[0],
        count: parseInt(sp[1]),
      }
    })

    let found = res.find((h) => h.hash === hashedPassword)
    if (found) {
      console.log(`Password is vulnarable \n ${found.count} matches found!`)
    } else {
      console.log('Password is safe\n NO matches found!')
    }
  }
}

function createPassword(input) {
  let password = ''

  // If input contains digits, use the digits as the password length. Otherwise use 8 as the password length
  let digitsRegex = /\d+/ // I hate REGEX btw :)
  let digitsMatch = input.match(digitsRegex)
  let length = digitsMatch ? parseInt(digitsMatch[0]) : 8

  // Create an array of possible characters for each style
  let capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let smallLetters = 'abcdefghijklmnopqrstuvwxyz'
  let specialChars = '-+_,;~@#$%^&*([{}])'
  let digits = '0123456789'

  // Initialize an array to store the possible characters
  let possibleChars = []

  // Add possible characters to the array based on the specified styles
  if (input.includes('b')) {
    possibleChars.push(...capitalLetters)
  }
  if (input.includes('s')) {
    possibleChars.push(...smallLetters)
  }
  if (input.includes('c')) {
    possibleChars.push(...specialChars)
  }
  if (input.includes('d')) {
    possibleChars.push(...digits)
  }

  // Add random characters to the password
  for (let i = 0; i < length; i++) {
    let randomIndex = crypto.randomBytes(1).readUInt8(0) % possibleChars.length
    let randomChar = possibleChars[randomIndex]
    password += randomChar
  }

  // Return the generated password
  return password
}

// Call the handleInput function with the user input
handleInput(input)
