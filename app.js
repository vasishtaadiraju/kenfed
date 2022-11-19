//const client = require('./connection.js')
const express = require('express');
const app = express();

app.listen(3300, ()=>{
    console.log("Sever is now listening at port 3300");
})

// Static Files
app.use(express.static("public"))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/media', express.static(__dirname + 'public/media'))
app.use('/plugins', express.static(__dirname + 'public/plugins'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Routes
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// var multer = require('multer');
// var upload = multer();
// app.use(upload.array());

var apiRouter=require('./routes/api.js');
app.use("/api",apiRouter);


// Navigation

app.get('/login', (req, res) => {
   res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/submit-profile', (req, res) => {
    res.render('submit-profile')
})

app.get('/payment-profile', (req, res) => {
    res.render('payment-profile')
})

app.get('/profile', (req, res) => {
    res.render('profile')
})

app.get('/leads', (req, res) => {
    res.render('leads')
})

app.get('/applications', (req, res) => {
    res.render('applications-pending')
})

app.get('/appinternal', (req, res) => {
    res.render('applications-internal')
})

app.get('/members', (req, res) => {
    res.render('members')
})

app.get('/add-employee', (req, res) => {
    res.render('add-employee')
})

app.get('/catalogue', (req, res) => {
    res.render('catalogue')
})

app.get('/add-catalogue', (req, res) => {
    res.render('add-catalogue')
})

app.get('/view-catalogue', (req, res) => {
    res.render('view-catalogue')
})

app.get('/add-lead', (req, res) => {
    res.render('add-lead')
})

app.get('/templates-list', (req, res) => {
    res.render('templates-list')
})

app.get('/assign-company', (req, res) => {
    res.render('assign-company')
})

app.get('/view-role', (req, res) => {
    res.render('view-role')
})

app.get('/test', (req, res) => {
    res.render('test')
})

app.get('/waiting-activation', (req, res) => {
    res.render('waiting-activation')
})

app.get('/waiting-verification', (req, res) => {
    res.render('waiting-verification')
})

app.get('/registration-success', (req, res) => {
    res.render('registration-success')
})

// Navigation
//Public Pages
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/category', (req, res) => {
    res.render('category')
})

app.get('/product', (req, res) => {
    res.render('product-detail')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})
