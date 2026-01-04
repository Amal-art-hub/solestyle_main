const Offers=require("../../models/offers");
const Product=require("../../models/product");
const Category=require("../../models/category");






const validateOfferData = (data) => {

    if (!data.name || data.name.trim() === "") {
        throw new Error("Offer Name is required");
    }
  
    const discount = parseInt(data.discount_percentage);
    if (isNaN(discount) || discount < 1 || discount > 99) {
        throw new Error("Discount must be between 1% and 99%");
    }

    if (!data.start_date || !data.end_date) {
        throw new Error("Start Date and End Date are required");
    }
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid dates provided");
    }
   
    if (endDate < startDate) {
        throw new Error("End Date cannot be before Start Date");
    }
   
    if (data.type === 'product') {
        if (!data.product_ids || data.product_ids.length === 0) {
            throw new Error("Please select at least one Product for a Product Offer");
        }
    } else if (data.type === 'category') {
        if (!data.category_ids || data.category_ids.length === 0) {
            throw new Error("Please select at least one Category for a Category Offer");
        }
    }
};

const listOffers=async(page=1,limit=10,search="")=>{
    const query={};
    if(search){
        query.name={$regex:new RegExp(search,"i")};
    };

    const offers=await Offers.find(query)
    .sort({createdAt:-1})
    .skip((page-1)*limit)
    .limit(limit);

    const count=await Offers.countDocuments(query);
    return {
        offers,
        totalPages:Math.ceil(count/limit),
        currentPage:page
    }
}

const getAddOfferService=async()=>{
try {
    const products=await Product.find({ isListed:true },'name _id');
const categories=await Category.find({ isListed:true },'name _id');
return {
    products,
    categories

};
} catch (error) {
    console.error(error);
      throw error;
}
}


const createOfferService = async (data) => {
 
    validateOfferData(data);
    
  
    const startDate = new Date(data.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
        throw new Error("Start Date cannot be in the past");
    }

    const offer = new Offers(data);
    return await offer.save();
};


const getOfferById = async (id) => {
    try {
        return await Offers.findById(id);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const updateOfferService = async (id, data) => {
   
    validateOfferData(data);
    
    const offer = await Offers.findByIdAndUpdate(id, data, { new: true });
    if (!offer) {
        throw new Error("Offer not found");
    }
    return offer;
};

const deleteOfferService=async(id)=>{
    return await Offers.findByIdAndDelete(id);
}


module.exports={
    listOffers,
    getAddOfferService,
    createOfferService,
    getOfferById,
    updateOfferService,
    deleteOfferService
}