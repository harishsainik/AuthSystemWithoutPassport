const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const config = require('../../../config/config.json')["development"];


//create function which will search for the user and returns a promise
function searchUser(email, phone){
    let promise = new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config);

        connection.connect((err) => {
            if(err){
                return reject(JSON.parse('{"status": "false", "msg": "Database connectivity error."}'));
            }
            let query = "select * from Persons where";
            if(email && phone){
                query += " email = " + mysql.escape(email) + " or phone = " + mysql.escape(phone); 
            }else if(phone){
                query += " phone = " + mysql.escape(phone);
            }else{
                //default case check on email
                query += " email = " + mysql.escape(email); 
            }
            console.log(query);
            connection.query(query, (err, result) => {
                //Close your connection
                connection.end();
                if (err){
                    console.log(err);
                    return reject(JSON.parse('{"status": "false", "msg": "An error occured."}'));
                }else{
                    console.log(result);
                    return resolve(result);
                }
            });
        });
    });
    return promise;
}
//email validator
function validateEmail(email) 
{
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}
//Phone validator
function validatePhoneNumber(phone)
{
  let phoneno = /^\d{10}$/;
  return phoneno.test(phone);
}


router.post('/register', (req,res) => {
    var {email, phone, password, confirmPassword} = req.body;
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
    //TODO: Add validations for Email and Phone
    if(email && !validateEmail(email)){
        return res.send(JSON.parse('{"status": "false", "msg": "Invalid Email"}'));
    }
    if(phone && !validatePhoneNumber(phone)){
        return res.send(JSON.parse('{"status": "false", "msg": "Invalid Phone Number"}'));
    }
    //We have to set them null explicityly because they default to empty, which creates issues
    //such as user already exist. It may also lead to error of unique key violation if user existance is not checked.
    if(!phone){
        phone = null
    }
    if(!email){
        email = null
    }
    //Create Object to store;
    var person = {
        email,
        phone,
        password
    };

    searchUser(email, phone).then((result)=>{
        if (result.length != 0){
            console.log(result);
            return res.send(JSON.parse('{"status": "false", "msg": "User Already exists."}'));
        }else{
            console.log("proceed to enter in db");
            //Hash your password before storing in the db;
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt,null,(err, hashPassword) => {
                    person.password = hashPassword;
                    
                    //query the database and process result.
                    let connection = mysql.createConnection(config);

                    connection.connect((err) => {
                        if(err){
                            return res.send(JSON.parse('{"status": "false", "msg": "Database connectivity error."}'));
                        }
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
            });
        }
    }).catch((jsonResponse)=>{
        return res.send(jsonResponse);
    }); 
});

router.post('/login', (req,res) => {
    const {email, phone, password } = req.body;
    //Validations
    if((!email && !phone) || !password){
        return res.send(JSON.parse('{"status": "false", "msg": "one or more fields are empty"}'));
    }
    
    searchUser(email, phone).then((result)=>{
        if (result.length == 1){
            console.log("Check password");
            var user = result[0];
            if(user){
                bcrypt.compare(password, user.password, (err, isMatched) => {
                    if(isMatched){
                        console.log("setting up users session");
                        //Set user in session
                        req.session.user = user;
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
    }).catch((jsonResponse)=>{
        return res.send(jsonResponse);
    }); 
});

module.exports = router;