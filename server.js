const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

//Use body parser of express
app.use(express.urlencoded({extended: false}));


const usersRoutes = require('./routes/users');
app.use('/user', usersRoutes);

//Serve static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));;


//Return 404 in case can't find url
app.use('*',(req,res)=>{
    res.status(404);
    res.sendFile(path.join(__dirname, 'public','pageNotFound.html'))
})

const PORT = 8080;
app.listen(PORT, ()=>{
    console.log(`Magic happnes at port: ${PORT}`);
});