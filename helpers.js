//creates an object with the same structure as the urlDatabase but which 
//only contains urls which were created by the user in question
const urlsForUser = function(id, database) {
  const urlsOfThatUser = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      urlsOfThatUser[shortURL] = database[shortURL];
    }
  }
  return urlsOfThatUser;
};

//extracts a user's unique ID from the urlDatabase based off of their email
const getUserByEmail = function(email, database) {
  for (let element in database) {
    if (database[element].email === email) {
      return element;
    } 
  }
};

//generates a random 6 character string from the options provided in randomOptions
const randomOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
const randomLength = 6;
const generateRandomString = function(length, content) {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += content[Math.floor(Math.random() * content.length)];
  }
  return randomString;
};

//checks that a given shortURL exists in the urlDatabase
const checkShortURLExists = function (shortURL, database) {
  if (database[shortURL]) {
    return true;
  } else {
    return false;
  }
};

//checks that the ID of the logged in user matches the ID of the shortURL in question 
const checkIdMatches = function (userId, shortURL, database) {
  const idInDatabase = database[shortURL].userID;
  if (userId === idInDatabase) {
    return true;
  } else {
    return false;
  }
};


module.exports = {getUserByEmail, 
                  generateRandomString, 
                  randomOptions, 
                  randomLength, 
                  checkShortURLExists, 
                  checkIdMatches,
                  urlsForUser};