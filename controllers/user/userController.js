const {getHomepageDate}=require("../../services/userService.js");


const pageNotFound = (req, res) => {
  res.status(404).render("page-404");
};



//for loading home pagfe
const loadHomepage=async(req,res)=>{
try{
    const data=getHomepageDate();
  return res.render("home",data);
}catch(error){
   console.log("Home page not found");
   res.status(500).send("Server error")
}
}

module.exports={loadHomepage,pageNotFound};