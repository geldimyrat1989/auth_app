const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/user');

//connecting to mongoDB:
mongoose.connect('mongodb://localhost:27017/authApp', {
    useNewUrlParser: true, useUnifiedTopology: true
})
    .then(() =>
    {
        console.log('Mongo Connection open!')
    })
    .catch(err =>
    {
        console.log('Oh Oh, ERROR!!!')
        console.log(err)
    })


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'thisissecret' }));

//this middleware function will check if the user_id exists in session:
const requireLogin = (req, res, next) =>
{
    //if it is not in session so it will:
    if (!req.session.user_id)
    {
        //redirect user to login page:
        return res.redirect('/login')
    }
    //if it exists user can go ahead:
    next();
}

app.get('/', (req, res) =>
{
    res.send('This is home page!')
})

app.get('/register', (req, res) =>
{
    res.render('register')
})

app.post('/register', async (req, res) =>
{
    const { password, username } = req.body;
    //getting the user parsed from req.body and making new user according to our schema:
    const user = new User({ username, password });
    //here before saving our pre middleware function will run and hash the password:
    await user.save();
    //and here req.session will get the particular user_id and remember:
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login', (req, res) =>
{
    res.render('login')
})

app.post('/login', async (req, res) =>
{
    const { password, username } = req.body;
    //here we using our model middle ware that compares the user:
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser)
    {
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    } else
    {
        res.redirect('/login');
    }
})

app.post('/logout', (req, res) =>
{
    //to logout we simply tell req.session set the user_id to null:
    //this way the browser will no longer keep the user signed in:
    req.session.user_id = null;
    //or we can use req.session.destroy()
    res.redirect('/login');
})

//this route will be available only if the user is registered and signed in:
app.get('/secret', requireLogin, (req, res) =>
{
    res.render('secret');
})

//this also will require login:
app.get('/topsecret', requireLogin, (req, res) =>
{
    res.send('top secret!!')
})


app.listen(3000, () =>
{
    console.log('Listening!!!')
})