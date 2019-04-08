const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/config.json')["development"];

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
    if(password.length < 6){
        return res.send(JSON.parse('{"status": "false", "msg": "Password must be atleast 6 characters long."}'));
    }
    if(password !== confirmPassword){
        return res.send(JSON.parse('{"status": "false", "msg": "Passwords do not match."}'));
    }
    
    //Create Object to store;
    var person = {
        email,
        phone,
        password
    }
    let connection = mysql.createConnection(config);

    connection.connect((err) => {
        if(err){
            return res.send(JSON.parse('{"status": "false", "msg": "Database connectivity error."}'));
        }
        
        connection.query("select * from Persons where email = " + mysql.escape(email) + "or phone = " + mysql.escape(phone), (err, result) => {
            //Close your connection
            if (err){
                return res.send(JSON.parse('{"status": "false", "msg": "An error occured."}'));
            }else{
                if (result.length != 0){
                    console.log(result);
                    return res.send(JSON.parse('{"status": "false", "msg": "User Already exists."}'));
                }else{
                    console.log("proceed to enter in db");
                    //TODO: Hash your password before storing in the db;
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt,null,(err, hashPassword) => {
                            person.password = hashPassword;
                            //query the database and process result.
                            connection.query("insert into Persons set ?", person, (err, result) => {
                                //Close your connection
                                connection.end();
                                if (err){
                                    return res.send(JSON.parse('{"status": "false", "msg": "An error occured."}'));
                                }else{
                                    if (result.affectedRows == 1){
                                        console.log("Data Inserted successfully");
                                        return res.send(JSON.parse('{"status": "true", "msg": "Successfully Registered"}'));
                                    }else
                                        return res.send(JSON.parse('{"status": "false", "msg": "An error occured."}'));
                                }
                            });
                        });
                    });
                }
            }
        });
        
    });
});

router.post('/login', (req,res) => {
    const {email, phone, password } = req.body;
    //Validations
    if((!email && !phone) || !password){
        return res.send(JSON.parse('{"status": "false", "msg": "one or more fields are empty"}'));
    }
    
    
    let connection = mysql.createConnection(config);

    connection.connect((err) => {
        if(err){
            return res.send(JSON.parse('{"status": "false", "msg": "Database connectivity error."}'));
        }
        
        connection.query("select * from Persons where email = " + mysql.escape(email) + "or phone = " + mysql.escape(phone), (err, result) => {
            //Close your connection
            connection.end();
            if (err){
                return res.send(JSON.parse('{"status": "false", "msg": "An error occured."}'));
            }else{
                if (result.length == 1){
                    console.log(result);
                    console.log("Check password");
                    var user = result[0];
                    if(user){
                        bcrypt.compare(password, user.password, (err, isMatched) => {
                            if(isMatched){
                                return res.send(JSON.parse('{"status": "true", "msg": "successfully Logged in."}'));
                            }else{
                                return res.send(JSON.parse('{"status": "false", "msg": "Wrong Password."}'));
                            }
                        });
                    }else{
                        return res.send(JSON.parse('{"status": "false", "msg": "An error occured."}'));
                    } 
                }else if(result.length > 1){
                    res.send(JSON.parse('{"status": "false", "msg": "Invalid credentials."}'));
                }else{
                    res.send(JSON.parse('{"status": "false", "msg": "User does not exist with the given mail or phone number."}'));
                }
            }
        });
        
    });
});
module.exports = router;