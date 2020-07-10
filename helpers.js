const getUserByEmail = function(email, database) {
  for (let element in database) {
    if (database[element].email === email) {
      return element;
    } 
  }
  return null;
};


module.exports = {getUserByEmail};