const mongoose = require ('mongoose');
const Schema=mongoose.Schema;

const addressSchema=new Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    name:{
        type:String,
        required:true,
    },
    address_line1:{
        type:String,
        required:true,
    },
    address_line2:String,
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    postal_code:{
        type:String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    alt_phone: String,
    is_default_shipping: {
        type: Boolean,
        default: false,
    },
    is_default_billing: {
        type: Boolean,
        default: false,
    }
},{ timestamps: true });

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;