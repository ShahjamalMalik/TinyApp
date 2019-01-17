const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id]
                     };
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user: users[req.cookies.user_id]
                     };
  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       user: users[req.cookies.user_id]
                     };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req,res) => {
  let templateVars = {};
  res.render("register", templateVars);
});

app.get("/login", (req,res) => {
  let templateVars = {};
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL
  res.redirect(`/urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
});

app.post("/urls/:id", (req,res)  => {

  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls");
});

app.post("/login", (req, res) => {

  let userID = retrieveUserID(req.body.email, req.body.password);
  if (userID === null) {
    res.status(403).send('Email not found!')
    return
   }
   if (userID === false) {
    res.status(403).send('Incorrect Password');
    return
   }

  console.log(users[req.cookies["user_id"]])
  res.cookie("user_id", userID)
  res.redirect("/urls");
});

app.post("/register", (req,res) => {
  var id = generateRandomString();
  let foundUser = null;
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please fill out missing fields');
  }

  for (var i in users) {
    if (users[i].email == req.body.email) {
      foundUser = users[i]
    }
  }

  if (foundUser) {
    res.status(400).send('Email already exists!')
  };

  users[id] =  {
    id,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
res.clearCookie('user_id');
res.redirect('/urls');
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

function retrieveUserID (email, password) {

for (var userID in users) {
  if (users[userID].email === email){
    if (users[userID].password === password) {
      return userID
    } else {

    return false
    }
  }
};
  return null;
}
