const mongoose=require("mongoose");
const{genSalt,hash,compare}=require("bcrypt");

const adminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
},{timestamps:true});


adminSchema.pre("save",async function (next)        {
    if(!this.isModified("password")) return next();
    try{
        const salt=await genSalt(10);
        this.password=await hash(this.password,salt);
    }catch(error){
        next(error);
    }
});

adminSchema.methods.comparePassword=async function (candidatePassword){
    return await compare(candidatePassword,this.password);
};
const Admin=mongoose.model("Admin",adminSchema);
module.exports=Admin;