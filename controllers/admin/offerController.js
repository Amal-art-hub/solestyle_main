const {
    listOffers,
    getAddOfferService,
    createOfferService,
    getOfferById,
    updateOfferService,
    deleteOfferService
}=require("../../services/adminSer/offerService");
const statusCode = require("../../utils/statusCodes.js");

const getOfferList=async(req,res)=>{
    try {
        const page=parseInt(req.query.page)||1;
        const limit=10;
        const search=req.query.search||"";

        const {offers,totalPages,currentPage}=await listOffers(page,limit,search);

        res.render("offerList",{
            offers,
            totalPages,
            currentPage,
            search,
        activePage: "offers"
    });

    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Error");
    }
};

const getAddOffer=async(req,res)=>{
    try {
        const {products,categories}=await getAddOfferService();
        res.render("addOfferPage",{
            products,
            categories,
            activePage: "offers"
        });
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Error");
    }
}

const addOffer = async (req, res) => {
    try {
        await createOfferService(req.body);
        res.status(statusCode.OK).json({ success: true, message: "Offer created successfully" });
    } catch (error) {
        console.error("Error adding offer:", error);
        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message || "Internal Server Error" });
    }
};


const getEditOffer=async(req,res)=>{
    try {
        const offer=await getOfferById(req.params.id);
        const{products,categories}=await getAddOfferService();
        res.render("editOfferPage",{
            offer,
            products,
            categories,
            activePage: "offers"
        })

    } catch (error) {
        
    }
}

const updateOffer = async (req, res) => {
    try {
        await updateOfferService(req.params.id, req.body);
        
        res.status(statusCode.OK).json({ success: true, message: "Offer updated successfully" });
    } catch (error) {
        console.error("Error updating offer:", error);
       
        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message || "Internal Server Error" });
    }
}

const deleteOffer=async(req,res)=>{
    try {
        await deleteOfferService(req.params.id);
        res.status(statusCode.OK).json({success:true,message:"Offer deleted successfully"});
    } catch (error) {
        console.error("Error deleting offer:",error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Failed to delete offer"});
    }
};

module.exports={
    getOfferList,
    getAddOffer,
    addOffer,
    getEditOffer,
    updateOffer,
    deleteOffer
}