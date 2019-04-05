const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req,res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'views', 'index.html'), (err) => {
        if(err){
            res.redirect('/error.html');
        }
    });
});
//TODO:If already logged in, redirect the user
router.get('/login', (req,res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'views', 'login.html'), (err) => {
        if(err){
            res.redirect('/error.html');
        }
    });
});

router.get('/register', (req,res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'views', 'register.html'), (err) => {
        if(err){
            res.redirect('/error.html');
        }
    });
});

router.post('/register', (req,res) => {
    const {email, phone, password, confirmPassword} = req.body;
    //Validations
    if((!email && !phone) || !password || !confirmPassword){
        return res.send(JSON.parse('{"status": "false", "msg": "one or more fields are empty"}'));
    }
    console.log("Still here");
    res.send("will be used to signup");
});

module.exports = router;