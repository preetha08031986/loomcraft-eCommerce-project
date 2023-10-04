const userCollection = require('../models/userDetails')
const productCollection= require('../models/productDetails')

const isLogin = async (req,res,next) =>{
    try{
        if(req.session.user){
            next();
        } else {
            const user = req.session.user;
            res.render("user/home",user)
        }
    } catch(error){
        console.log(error.message);
    }
}

const isLogout = async (req,res,next) => {
    try{
        if(req.session.user){
            res.redirect("/")
        }else{
            next();
        }
    }catch(error){
        console.log(error.message);
    }
}

const isblocked = async (req,res,next) => {
    try{
      if(req.session.user){
        
        const user = req.session.user
        const check = await userCollection.findOne({ email:user });
        if(check.status === false){
          next();
      }
    
    else{
         req.session.email = null;
         req.session.user = null;
          res.render('user/login',{user,message:"Please contact Your Admin You are no longer to access this account"});
        
      }
      }

      
     
    }catch(err){
      console.log(err.message);
    }
   
}
  const userChecking = (req,res,next)=>{

    if(req.session.user){
        next();
    }else{
        res.render('user/login')
    }
  }
module.exports = {
    isLogin,
    isLogout,
    isblocked,
    userChecking,

}

