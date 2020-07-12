const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const createApplication = require("express/lib/express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['soloongsoobnoxiousimeanitssoooooolong', 'anotherloooongbeastofastringdogcathorsebunnycowmooooo']
}));


app.set("view engine", "ejs");


//sample of how data is organized in the urlDatabase
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJurls48lW" }
};

//sample of how data is organized in the users database
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
};


// GET '/' sends logged in users to the '/urls' page and logged out users to the '/login' page
app.get('/', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET '/urls' displays the urls created by that logged in user 
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const urlsOfUserDatabase = helpers.urlsForUser(userId, urlDatabase);
  const templateVars = { urls: urlsOfUserDatabase, user: users[userId] };
  res.render('urls_index', templateVars);
});

// GET '/urls/new' displays the 'urls_new' page for logged in users and redirects to the '/login' page for logged out users
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const templateVars = {
      'user': users[userId]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET '/urls/:shortURL' displays the 'urls_show" page if the shortURL provided exists, if not if sends a 404 error and displays the error message "That shortURL is not in our database"
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (helpers.checkShortURLExists(shortURL, urlDatabase)) {
    const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
    const userId = req.session.user_id;
    const userIdOFThisUrlInDatabase = urlDatabase[shortURL].userID;
    templateVars['idOfURLInDatabase'] = userIdOFThisUrlInDatabase;
    templateVars['user'] = users[userId];
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send('That shortURL is not in our database!');
  }
});

// GET '/u/:shortURL' redirects the the link contained in the longURL associated with the provided shortURL given the shortURL exists, otherwise it sens a 404 error and the message "That shortURL is not in our database"
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (helpers.checkShortURLExists(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('That shortURL is not in our database!');
  }
});

// GET '/register' shows the 'users_new" page where the user can register themselves
app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('users_new', templateVars);
});

// GET '/login' shows the 'users_login' page where the user can login
app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('users_login', templateVars);
});

// POST '/register' checks that the user has submitted an email and password, checks that the email is not already in the website, and then creates an entry in the users database for the new user and redirects them to the '/urls' page. If the email or password on the form are blank, or if the email already exists in the user database, it sends a 400 status code and related error message
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    const userEmail = req.body.email;
    if (!helpers.getUserByEmail(userEmail, users)) {
      const userId = helpers.generateRandomString(helpers.randomLength, helpers.randomOptions);
      const userPassword = req.body.password;
      const hashedPassword = bcrypt.hashSync(userPassword, 10);
      let user = {};
      user['id'] = userId;
      user['email'] = userEmail;
      user['password'] = hashedPassword;
      users[userId] = user;
      req.session.user_id = userId;
      res.redirect('/urls');
    } else {
      return res.status(400).send('Error! The email submitted is already in our database.');
    }
  } else {
    res.status(400).send('Error! The email or password field is blank');
  }
});

// DELETE '/urls/:shortURL' checks that a shortURL exists in the database and checks that the logged in user is the one who created it. If so, it deletes the shortURL and associated data from the urlDatabase, otherwise it sends a related error message.
app.delete('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (helpers.checkShortURLExists(shortURL, urlDatabase)) {
    const userId = req.session.user_id;
    if (helpers.checkIdMatches(userId, shortURL, urlDatabase)) {
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    } else {
      res.send("You can only delete shortURLs that you created!");
    }
  } else {
    res.send('The shortURL doesn\'t exist!');
  }
});

// PUT '/urls/:id' checks that a shortURL exists in the database and checks that the logged in user is the one who created it. If so, it updates the associated longURL with the value provided and redirects the user to '/urls'. Otherwise, it sends a related error message.
app.put('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  const userId = req.session.user_id;
  if (helpers.checkShortURLExists(shortURL, urlDatabase)) {
    if (helpers.checkIdMatches(userId, shortURL, urlDatabase)) {
      urlDatabase[shortURL].longURL = updatedLongURL;
      res.redirect('/urls');
    } else {
      res.send('You can only update URLs that you created!');
    }
  } else {
    res.send('The shortURL you are attempting to update does not exist!');
  }
  
});

// POST '/urls' creates a randomly generated shortURL based on the longURL provided and adds the short and longURL's to the urlDatabase and redirects the user to '/urls/shortURL'.
app.post('/urls', (req, res) => {
  const shortURL = helpers.generateRandomString(helpers.randomLength, helpers.randomOptions);
  const longURL = req.body.longURL;
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {longURL: longURL, userID: userId};
  res.redirect(`/urls/${shortURL}`);
});

// POST '/login" uses the email provided to check that the user exists in the database and checks that the password provided matches the password used when they originally registered. If so it redirects them to the '/urls' page, if not it sends a 403 status code and relevant error message.
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userId = helpers.getUserByEmail(userEmail, users);
  if (userId) {
    const hashedPassword = users[userId].password;
    const passwordSubmitted = req.body.password;
    if (bcrypt.compareSync(passwordSubmitted, hashedPassword)) {
      req.session.user_id = userId;
      res.redirect('/urls');
    } else {
      res.status(403).send('Error! The password does not match our records.');
    }
  } else {
    res.status(403).send('Error! The email provided is not in our database');
  }
});

// POST '/logout' deletes the session cookies and redirects to the '/urls' page
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

