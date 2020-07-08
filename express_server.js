const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const createApplication = require("express/lib/express");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const randomOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
const randomLength = 6;
function generateRandomString(length, content) {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += content[Math.floor(Math.random() * content.length)];
  }
  return randomString;
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
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  //console.log('req.cookies = ', req.cookies);
  const templateVars = { urls: urlDatabase , username: req.cookies['username']};
  res.render("urls_index", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  // const longURL.....
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  const sURL = req.params.shortURL;
  // console.log('sURL = ', sURL);
  // console.log('urlDatabase[sURL] = ', urlDatabase[sURL])
  const templateVars = { username: req.cookies["username"], shortURL: sURL, longURL: urlDatabase[sURL] };
  res.render("urls_show", templateVars);
});

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
  //set a cookie named username to the value submitted in the request body
  //console.log('request body = ', req.body); //contains an object with a key username and value what was typed
  const usernameSubmitted = req.body.username;
  res.cookie('username', usernameSubmitted);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  //res.clearCookie clears the cookie by name
  res.clearCookie('username'); 
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


