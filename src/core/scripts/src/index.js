const bodyParser = require('body-parser');
const pug = require("pug");
let compileAttrs = require('pug-attrs');
let pugRuntime = require('pug-runtime');

const path = require('path');
const express = require("express");
const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({extended: false}));

let attrs = [
    {name: 'name_app',  val: 'transUp()', mustEscape: true },
    {name: 'ver_project',  val: 'transUp()', mustEscape: true },
  ];

let mod_pkg = [
    {id: 'subgraph',  value: 'subgraph-tools', selected: false },
    {id: 'supergraph',  value: 'supergraph-tools', selected: false },
    
  ];

 let name_app = ''; 

app.use('/static', express.static('static'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const transUp = () => {
    console.log('name_app', 'name_app');
    return 'name_app' 
}


let result, finalResult;  

result = compileAttrs(attrs, {
    terse:   true,
    format:  'object',
    runtime: function (name) { return 'pugRuntime.' + name; }
  });

  finalResult = Function('pugRuntime, transUp',
  'return (' + result + ');'
);

finalResult(pugRuntime, transUp); 


app.get('/', function (req, res) {
    res.render('new_form', 
    {mod_pkg, name_app, inlineRuntimeFunctions: true }
    // {name: 'name_app', val: pugRuntime.escape(transUp()), mustEscape: true }
    );
});







app.post("/new_form", function (req, res) {
    // const feedData = new feedModal({
    //     name: req.body.name,
    //     email: req.body.email,
    //     feed: req.body.feedback
    // });

    // feedData.save().then(data => { res.render('feedback_form', { msg: "Your feedback successfully saved." }); }).catch(err => { res.render('feedback_form', { msg: "Check Details." }); }); 
});
        
app.listen(port, () => {
    console.log("server is running");
});