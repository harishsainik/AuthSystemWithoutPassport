//Middleware to check for req.session.user
//if req.session.user is not found, let proceed, else redirect to home page
module.exports = (req,res,next) => {
    if(req.session && req.session.user){
        return res.redirect('/');
    }else{
        return next();
    }
}