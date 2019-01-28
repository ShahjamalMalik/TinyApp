const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  secret: "string"}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL : "http://www.lighthouselabs.ca",
             userID : "userRandomID",
            },


  "9sm5xK": {longURL: "http://www.google.com",
             userID: "user2RandomID",
            }

};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}
// Generates random string for the ID
function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

// Function to retrieve userID
function retrieveUserID (email, password) {
for (var userID in users) {
  if (users[userID].email === email){
    if (bcrypt.compareSync(password, users[userID].password)) {
      return users[userID]
    } else {

    return false
    }
  }
}

}

//Function to make URLs created exclusive to User who created
function urlsForUser(id) {
  let urlForThisUser = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urlForThisUser[url] = urlDatabase[url];
    }
  }
  return urlForThisUser;
}

// Create new URL, if not logged in will redirect to the login page.
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id]
                     };
  if (users[req.session.user_id] === undefined) {
    res.redirect("/login")
  }
  else {
    res.render("urls_new");
  }
});

app.get("/", (req, res) => {
res.redirect("/urls")
});
// Will show data as JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// Main page that will display the URLs
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id),
                       user: users[req.session.user_id]
                     };
  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       user: users[req.session.user_id]
                     };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//Register page
app.get("/register", (req,res) => {
  let templateVars = {};
  res.render("register", templateVars);
});
//Login page
app.get("/login", (req,res) => {
  let templateVars = {};
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID == req.session.user_id) {
  delete urlDatabase[req.params.id]
}
  res.redirect("/urls");
});

app.post("/urls/:id", (req,res)  => {
  if (urlDatabase[req.params.id].userID == req.session.user_id) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
  }

  res.redirect("/urls");
});

app.post("/login", (req, res) => {

  let user = retrieveUserID(req.body.email, req.body.password);
  if (!user) {
    res.status(401).send("The email or password that was entered is incorrect!")
   } else {

  req.session.user_id = user.id
  res.redirect("/urls");
  }
});

app.post("/register", (req,res) => {
  const id = generateRandomString();
  let foundUser = null;
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please fill out missing fields");
    return;
  }

  for (var user in users) {
    if (users[user].email == req.body.email) {
      foundUser = users[user]
    }
  }

  if (foundUser) {
    res.status(400).send("Email already exists!")
  }

  users[id] =  {
    id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
req.session = null;
res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
