const getUserByEmail = function(email, database) {
  console.log('email, database = ', email, database);
  for (let element in database) {
    if (database[element].email === email) {
      return element;
    } 
  }
};


module.exports = {getUserByEmail};