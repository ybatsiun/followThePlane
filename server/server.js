
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const User = require('./models/user');
const {authenticate} = require('./middleware/authenticate');
const session = require('express-session')
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(session({
    secret: 'ybats',
    resave: true,
    saveUninitialized: false
}));

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

app.get('/', (req, res) => {
    res.send({
        welcomeMessage: "Hello!"
    });
});

app.post('/login',authenticate,(req,res)=>{
    res.header('userID',req.user._id).send(req.user);
    req.session.userID = req.user._id;
});

app.post('/newUser', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });
    newUser.save().then(user => {
        res.send(user);
    }, e => {
        res.status(400).send(e);
    });
});

app.get('/logout', function(req, res, next) {
    if (req.session) {
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

module.exports = app;