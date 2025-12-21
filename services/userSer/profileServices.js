const User = require("../../models/user.js");
const Address=require("../../models/address.js")
const bcrypt = require("bcrypt");
const { generateOtp, sendVerificationEmail } = require("./userService");




//--------------------------------------------------------loading user profile
const getUserProfile = async (userId) => {
    try {
        return await User.findById(userId);
    } catch (error) {
        throw error;
    }
}

//----------------------------------------------------------updating edited data on  profile

const updateUserProfile = async (userId, data) => {
    try {
        return await User.findByIdAndUpdate(userId, data, { new: true });
    } catch (error) {
        throw error;
    }
}


//-----------------------------------------updating password

const changePassword = async (userId, oldPass, newPass) => {
    try {
        const user = await User.findById(userId);
        if (!await bcrypt.compare(oldPass, user.password)) return {
            success: false, message: "Incorrect password"
        };
        user.password = newPass;
        await user.save();
        return { success: true };
    } catch (error) {
        throw error;
    }
}

//-------------------------------requesting email otp

const requestEmailChange = async (userId, newEmail) => {
    try {
        if (await User.findOne({ email: newEmail })) return {
            success: false, message: "Email taken"
        }
        const otp = generateOtp();
        console.log("Generated OTP:", otp);

        await sendVerificationEmail(newEmail, otp);
        return { success: true, otp };


    } catch (error) {
        throw error;
    }
}

//---------------------------verify otp

const verifyOtp = async (typedOtp, sessionOtp, userId, newEmail) => {

    try {
        console.log("--- OTP DEBUG ---");
        console.log("Typed:", typedOtp, typeof typedOtp);
        console.log("Session:", sessionOtp, typeof sessionOtp);
        console.log("Equal?", String(typedOtp).trim() === String(sessionOtp).trim());
        console.log("-----------------");

        if (!sessionOtp) {
            return { success: false, message: "Session expired. Please request a new OTP." };
        }

        if (String(typedOtp).trim() !== String(sessionOtp).trim()) {
            return { success: false, message: "Invalid OTP (Mismatch)" }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
        if (!updatedUser) {
            return { success: false, message: "user not found" };
        }

        return { success: true, message: "Email updated successfully", user: updatedUser };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" };
    }


}

const getAddressByUserId=async(userId)=>{
    return await Address.find({user_id:userId});
}


const addAddressService=async(userId,data)=>{
    try {
        if(data.is_default_shipping === 'true' || data.is_default_shipping === true){
            await Address.updateMany({user_id:userId},{is_default_shipping:false});
        }

        if(data.is_default_billing==="true"||data.is_default_billing===true){
            await Address.updateMany({user_id:userId},{is_default_billing:false});
        }
        const newAddress=new Address({user_id:userId,...data});
        return await newAddress.save();

    } catch (error) {
        throw error;
    }
}


const editAddressService = async (addressId, userId, data) => {
    try {
        
        if (data.is_default_shipping === 'true' || data.is_default_shipping === true) {
            await Address.updateMany({ user_id: userId }, { is_default_shipping: false });
        }
        

        if (data.is_default_billing === 'true' || data.is_default_billing === true) {
             await Address.updateMany({ user_id: userId }, { is_default_billing: false });
        }
 
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId, user_id: userId },
            data,
            { new: true }
        );
        return updatedAddress;
    } catch (error) {
        throw error;
    }
};


const deleteAddressServic = async (addressId, userId) => {
    try {
        return await Address.findOneAndDelete({ _id: addressId, user_id: userId });
    } catch (error) {
        throw error;
    }
};



module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    requestEmailChange,
    verifyOtp,
    getAddressByUserId,
    addAddressService,
    editAddressService,
    deleteAddressServic
}