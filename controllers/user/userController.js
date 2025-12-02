const {getHomepageDate,createUser,findUserByEmail}=require("../../services/userService.js");


const pageNotFound = (req, res) => {
  res.status(404).render("page-404");
};



//for loading home page
const loadHomepage=async(req,res)=>{
try{
    const data=getHomepageDate();
  return res.render("home",data);
}catch(error){
   console.log("Home page not found");
   res.status(500).send("Server error")
}
}


//for loading signup page
const loadSignup=async(req,res)=>{
  try{
   return res.render("signup");
  }catch(error){

    console.log("signup page error :",error);
    res.status(500).send("Server Error");

  }
}


//submitting signup page

const signup=async(req,res)=>{
   const{firstName,lastName,email,phone,password,confirmPassword}=req.body;
  try {
   
    if(password!==confirmPassword){
      return res.status(400).send("Password does not match");

    }
    const existingUser=await findUserByEmail(email);
    if(existingUser){
      return res.status(400).send("Email already registered");
    }
    
    const newUser=await createUser({
      firstName,lastName,email,phone,password
    });

    console.log(newUser);

    // return res.redirect("/login");
        return res.status(200).json({ 
      success: true, 
      message: "Registration successful! Redirecting to login...",
      redirect: "/login"
    });


  } catch (error) {
    // res.status(500).send("Internalserver error");
    console.error("Signup error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "An error occurred during registration. Please try again." 
    });
  }
}



module.exports={loadHomepage,pageNotFound,loadSignup,signup};