const User=require("../models/user.js")



const getHomepageDate=()=>{
    return  {
        pageTitle:"Home Page"
    };
};

//for uploading the data to db

const createUser=async({firstName,lastName,email,phone,password})=>{
    const name=`${firstName} ${lastName}`;
    const newUser=new User({
    name,
    email,
    phone,
    password
    });

    return await newUser.save();

}


const findUserByEmail=async(email)=>{
return await User.findOne({email});
}

module.exports={getHomepageDate,createUser,findUserByEmail};


