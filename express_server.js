const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const createApplication = require("express/lib/express");
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')


app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['soloongsoobnoxiousimeanitssoooooolong', 'anotherloooongbeastofastringdogcathorsebunnycowmooooo']
}));

app.set("view engine", "ejs");


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJurls48lW" }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}



const randomOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
const randomLength = 6;
function generateRandomString(length, content) {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += content[Math.floor(Math.random() * content.length)];
  }
  return randomString;
};

const urlsForUser = function (id) {
  const urlsOfThatUser = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsOfThatUser[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsOfThatUser;
}

const getUserByEmail = function(email, object) {
  for (let element in object) {
    if (object[element].email === email) {
      return element;
    } 
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  // console.log('req.body = ',req.body)
  // console.log('req.cookies = ', req.cookies);
  //check that there is a user_id property in the req.cookies
  if (req.session.user_id) {
    const user_id = req.session.user_id;
    const templateVars = {
      'user': users[user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


app.get('/urls', (req, res) => {
  //console.log('req.cookies = ', req.cookies);
  const user_id = req.session.user_id;
  const urlsOfUserDatabase = urlsForUser(user_id);
  const templateVars = { urls: urlsOfUserDatabase, user: users[user_id] };
  //console.log('tempvar = ', templateVars);
  res.render("urls_index", templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  //console.log('shortURL = ', shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  //console.log('longURL = ', longURL);
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  //only display if user is logged in 
  //if the user is logged in, only display if they made that URL
  //compare the user_id in the cookie to the userID associated with the shortURLs's user_id in the database 
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  const user_id = req.session.user_id;
  const userIdOFThisUrlInDatabase = urlDatabase[shortURL].userID;
  templateVars['idOfURLInDatabase'] = userIdOFThisUrlInDatabase;
  templateVars['user'] = users[user_id];
  //console.log('templateVars is = ', templateVars);
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('users_new', templateVars);
})


app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('users_login', templateVars);
})

app.post('/register', (req, res) => {
  //console.log('req body = ', req.body);
  if (req.body.email && req.body.password) {
    const userEmail = req.body.email
    if (getUserByEmail(userEmail, users) === null) {
      const userId = generateRandomString(randomLength, randomOptions);
      const userPassword = req.body.password;
      const hashedPassword = bcrypt.hashSync(userPassword, 10);
      //console.log('hashedPass = ', hashedPassword)
      let user = {};
      user['id'] = userId;
      user['email'] = userEmail;
      user['password'] = hashedPassword;
      users[userId] = user;
      //console.log('users object = ', users);
      //res.cookie('user_id', userId);
      req.session.user_id = userId;
      res.redirect('/urls');
    } else {
      return res.status(400).send("Error! The email submitted is already in our database.");
    }
  } else {
    res.status(400).send("Error! The email or password field is blank");
  }
})

// const checkURLExists = function (shortURL) {
//   //check to see if the shortURL is in the urlDatabase, if it's not return false
//   const exists = '';
//   for (let item in urlDatabase) {
//     if (item === shortURL) {
//       exists += item;
//     }
//   }
//   if(!exists) {
//     return false;
  
//   //check to see if user_ir === user_id stored in the database 
//   }
//   let user_id = req.cookies.user_id;
//   let idInDatabase = urlDatabase[shortURL].userID;
//   if (user_id === idInDatabase) {
//     return true;
//   } else {
//     return false;
//   }
// }

app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log('req.body = ', req.body); //{}
  // console.log('req.params = ', req.params); //shortURL
  // console.log('req.cookies = ', req.cookies); //user_id
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  if (urlDatabase[shortURL]) {
    const userIdOFThisUrlInDatabase = urlDatabase[shortURL].userID;

    if (user_id === userIdOFThisUrlInDatabase) {
      
      //console.log('shortURL = ', shortURL);
      delete urlDatabase[shortURL];
      //console.log('database after = ', urlDatabase);
      //const templateVars = { urls: urlDatabase };
      res.redirect('/urls');
    } else {
      res.send("You can only delete shortURLs that you created!");
    }
  } else {
    res.send('The shortURL doesn\'t exist!');
  }
})

app.post('/urls/:id', (req, res) => {
  //update long URL with what was submitted 
  // console.log('req params = ', req.params);
  // console.log('request body  = ', req.body);
  //make a function that check is url exists 
  
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  const user_id = req.session.user_id;
  if ( urlDatabase[shortURL]) {
    const userIdOFThisUrlInDatabase = urlDatabase[shortURL].userID;
    if (user_id === userIdOFThisUrlInDatabase) {
      urlDatabase[shortURL].longURL = updatedLongURL;
      res.redirect('/urls');
    } else {
      //cant edit what you didnt create
      res.send('You can only update URLs that you created!');
    }
  } else {
    //shortURL doesn't exist 
    res.send("The shortURL you are attempting to update does not exist!")
  }
  
})

app.post("/urls", (req, res) => {
  //console.log('req.body = ', req.body);  // Log the POST request body to the console
  // console.log("random string = ", generateRandomString(randomLength, randomOptions))
  // console.log('req.body.longURL = ', req.body.longURL)
  const shortURL = generateRandomString(randomLength, randomOptions);
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;
  // console.log('req.cookies = ', req.cookies);
  // console.log('shortURL = ', shortURL);
  // console.log('longURL = ', longURL);
  // console.log('urlDatabase before = ', urlDatabase);
  urlDatabase[shortURL] = {longURL: longURL, userID: user_id};

  //console.log('urlDatabase after update = ', urlDatabase);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  //const templateVars = {shortURL, longURL}
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  //take the email from here, use this too look them up in teh users object, if they exists return the user id then use this to set the cookie
  const userEmail = req.body.email;
  const user_id = getUserByEmail(userEmail, users);
  if (user_id) {
    const hashedPassword = users[user_id].password;
    const passwordSubmitted = req.body.password;
    if (bcrypt.compareSync(passwordSubmitted, hashedPassword)) {
      //console.log('passwords match!')

    //how do i get the user_id using the email???
    //verify that the email is in the users object using function
    //if it's there then figure out which user element it's in
    //console.log("user_id = ", user_id);
    //res.cookie('user_id', user_id);
    req.session.user_id = user_id;
    res.redirect('/urls');
    } else {
      res.status(403).send('Error! The password does not match our records.')
    }
  } else {
    res.status(403).send('Error! The email provided is not in our database');
  }
})


app.post('/logout', (req, res) => {
  //res.clearCookie clears the cookie by name!
  //res.clearCookie('user_id'); 
  //clear a session by setting it to null
  req.session = null;
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


