const isLogin = async (req,res,next) => {
    try{
        if(req.session.admin){
            next();
        }
        else {
            res.redirect('/admin/login');
        }
    }catch (error){
        console.log(error.message);
    }
}

const isLogout = async (req,res,next) => {
    try{
        if(req.session.admin) {
            res.redirect('/admin/login');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}
const adminChecking = (req,res,next) =>{
    console.log("req.session.admin>>",req.session.admin);
    if(req.session.admin){
        next()
    }else{
        res.render('admin/login')
    }
}

module.exports = {
    isLogin,
    isLogout,
    adminChecking,
}