// Require express to make easy
// routing on server side.
const express = require("express");
 
// Creating express object
const app = express();
 
// Require path module
const path = require('path');
 
// Require pug template engine
const pug = require("pug");
 
// Require mongoose to use mongoDb
// in a easier way
const mongoose = require("mongoose");
 
// Define a port number
const port = 3000;
 
// Make a static route to use your
// static files in client side
app.use('/static', express.static('static'));
 
// Middleware for parsing
app.use(express.urlencoded());
 
// Define and use pug engine so also
// declare path on rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
 
// Database Connection
mongoose.connect(
    "mongodb://localhost:27017/feedback",
    { useUnifiedTopology: true }
);
 
// Create schema
const feedSchecma = mongoose.Schema({
    name: String,
    email: String,
    feed: String
});
 
// Making a modal on our already
// defined schema
const feedModal = mongoose
    .model('feeds', feedSchecma);
 
// Handling get request
app.get('/', function (req, res) {
    // Rendering your form
    res.render('feedback_form');
});
 
// Handling data after submission of form
app.post("/feedback_form", function (req, res) {
    const feedData = new feedModal({
        name: req.body.name,
        email: req.body.email,
        feed: req.body.feedback
    });
    feedData.save()
        .then(data => {
            res.render('feedback_form',
{ msg: "Your feedback successfully saved." });
        })
        .catch(err => {
            res.render('feedback_form',
                { msg: "Check Details." });
        });
})
 
// Server setup
app.listen(port, () => {
    console.log("server is running");
});