const getUserByEmail = function(email, database) {
  for (let element in database) {
    if (database[element].email === email) {
      return element;
    } 
  }
};


const randomOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
const randomLength = 6;
const generateRandomString = function(length, content) {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += content[Math.floor(Math.random() * content.length)];
  }
  return randomString;
};


const checkShortURLExists = function (shortURL, database) {
  if (database[shortURL]) {
    return true;
  } else {
    return false;
  }
}

module.exports = {getUserByEmail, 
                  generateRandomString, 
                  randomOptions, 
                  randomLength, 
                  checkShortURLExists};