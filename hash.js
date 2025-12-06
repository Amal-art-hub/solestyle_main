const bcrypt=require("bcrypt");

async function gen(){
    const salt=await bcrypt.genSalt(10);
    const hashed =await bcrypt.hash("admin123",salt);
    console.log("hashed password:",hashed);
}

gen();
