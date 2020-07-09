const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const createApplication = require("express/lib/express");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

const getIdByEmail = function(email, object) {
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
  if (req.cookies.user_id) {
    const user_id = req.cookies.user_id;
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
  const templateVars = { urls: urlDatabase };
  const user_id = req.cookies.user_id;
  templateVars['user'] = users[user_id];
  console.log('tempvar = ', templateVars);
  res.render("urls_index", templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('shortURL = ', shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  console.log('longURL = ', longURL);
  res.redirect(longURL);
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  const user_id = req.cookies.user_id;
  templateVars['user'] = users[user_id];
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  const user_id = req.cookies.user_id;
  templateVars['user'] = users[user_id];
  //console.log('template vars = ', templateVars); //keys present, values undefined, try just testing for presense of user not it's values so it's not showing up as cannot take property of undefined???
  res.render('users_new', templateVars);
})


app.get('/login', (req, res) => {
  //need to add TempVar so user is not undefined in the header
  const templateVars = { urls: urlDatabase };
  const user_id = req.cookies.user_id;
  console.log('user_id = ', user_id);
  console.log('this is the user object = ', users["user_id"]);
  templateVars['user'] = users[user_id];
  console.log('template vars = ', templateVars);
  res.render('users_login', templateVars);
})

app.post('/register', (req, res) => {
  //console.log('req body = ', req.body);
  if (req.body.email && req.body.password) {
    const userEmail = req.body.email
    if (getIdByEmail(userEmail, users) === null) {
      const userId = generateRandomString(randomLength, randomOptions);
      const userPassword = req.body.password;
      let user = {};
      user['id'] = userId;
      user['email'] = userEmail;
      user['password'] = userPassword;
      users[userId] = user;
      //console.log('users object = ', users);
      res.cookie('user_id', userId);
      res.redirect('/urls');
    } else {
      return res.status(400).send("Error! The email submitted is already in our database.");
    }
  } else {
    res.status(400).send("Error! The email or password field is blank");
  }
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('shortURL = ', shortURL);
  delete urlDatabase[shortURL];
  console.log('database after = ', urlDatabase);
  //const templateVars = { urls: urlDatabase };
  res.redirect('/urls');
})

app.post('/urls/:id', (req, res) => {
  //update long URL with what was submitted 
  //console.log('req params = ', req.params);
  //console.log('request body  = ', req.body);
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // console.log("random string = ", generateRandomString(randomLength, randomOptions))
  // console.log('req.body.longURL = ', req.body.longURL)
  const shortURL = generateRandomString(randomLength, randomOptions);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  //console.log('urlDatabase after update = ', urlDatabase);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  //const templateVars = {shortURL, longURL}
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  //take the email from here, use this too look them up in teh users object, if they exists return the user id then use this to set the cookie
  const userEmail = req.body.email;
  const user_id = getIdByEmail(userEmail, users);
  if (user_id) {
    const passwordInUsers = users[user_id].password;
    const passwordSubmitted = req.body.password;
    if (passwordSubmitted === passwordInUsers) {

    //how do i get the user_id using the email???
    //verify that the email is in the users object using function
    //if it's there then figure out which user element it's in
    //console.log("user_id = ", user_id);
    res.cookie('user_id', user_id);
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
  res.clearCookie('user_id'); 
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


