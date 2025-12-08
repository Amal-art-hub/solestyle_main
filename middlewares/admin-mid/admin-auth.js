
const isAdminLoggedIn=(req,res,next)=>{
    if(!req.session.admin){
        return res.redirect("/admin/login")
    }else{
        next();
    }
}

module.exports={isAdminLoggedIn};