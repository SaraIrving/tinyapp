const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const createApplication = require("express/lib/express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');


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



app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const urlsOfUserDatabase = helpers.urlsForUser(userId, urlDatabase);
  const templateVars = { urls: urlsOfUserDatabase, user: users[userId] };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const templateVars = {
      'user': users[userId]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (helpers.checkShortURLExists(shortURL, urlDatabase)) {
    const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
    const userId = req.session.user_id;
    const userIdOFThisUrlInDatabase = urlDatabase[shortURL].userID;
    templateVars['idOfURLInDatabase'] = userIdOFThisUrlInDatabase;
    templateVars['user'] = users[userId];
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('That shortURL is not in our database!');
  }
});


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (helpers.checkShortURLExists(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('That shortURL is not in our database!');
  }
});


app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('users_new', templateVars);
});


app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('users_login', templateVars);
});

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
      return res.status(400).send("Error! The email submitted is already in our database.");
    }
  } else {
    res.status(400).send("Error! The email or password field is blank");
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
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

app.post('/urls/:id', (req, res) => {
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
    res.send("The shortURL you are attempting to update does not exist!");
  }
  
});

app.post("/urls", (req, res) => {
  const shortURL = helpers.generateRandomString(helpers.randomLength, helpers.randomOptions);
  const longURL = req.body.longURL;
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {longURL: longURL, userID: userId};
  res.redirect(`/urls/${shortURL}`);
});

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


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

