const express = require('express');
const router = express.Router();
const path = require('path');

const isAuthenticated = require('../../../middleware/isAuthenticated');
const isAlreadyLoggedin = require('../../../middleware/isAlreadyLoggedin');


const usersApi = require('../api/usersApi');
router.use('/api',usersApi);

//If already logged in, redirect the user
router.get('/login',isAlreadyLoggedin, (req,res) => {
    res.sendFile(path.join(path.dirname(path.dirname(path.dirname(__dirname))), 'views', 'login.html'), (err) => {
        if(err){
            return res.redirect('/error.html');
        }
    });
});
//If already logged in, redirect the user
router.get('/register',isAlreadyLoggedin, (req,res) => {
    res.sendFile(path.join(path.dirname(path.dirname(path.dirname(__dirname))), 'views', 'register.html'), (err) => {
        if(err){
            return res.redirect('/error.html');
        }
    });
});
//If not logged in, redirect the user
router.get('/logout',isAuthenticated, (req,res) => {
    req.session.destroy(function(err) {
        if(err){
            console.log("error while logging out the user");
            return res.send("<h1>Could not logout. Something went Wrond.</h1>")
        }else{
            console.log('session has been destroyed');
            return res.send("<h1>You have successfully logged out.</h1>");
        }
    });
});

module.exports = router;