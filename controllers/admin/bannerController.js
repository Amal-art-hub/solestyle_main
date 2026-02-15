import { getAllBanners,
     getBrandSection,
    addBanner } from "../../services/adminSer/bannerService.js";
import statusCode from "../../utils/statusCodes.js";

export const getBannerPagecont = async (req, res) => {
    try {
        const [banner, brandSection] = await Promise.all([getAllBanners(), getBrandSection()]);
        res.render("banners", {
            banners: banner,
            brandSection: brandSection || {}
        });
    } catch (error) {
        console.error("Error loading banners page:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};


export const addBannerCont=async(req,res)=>{
    try {
        const {title,subtitle,link,order}=req.body;
        const image=req.file?req.file.path:null;
        if(!image){
            return 
            res.status(statusCode.BAD_REQUEST).json({success:false,message:"Image is required"});
        }

        await addBanner({title,subtitle,link,order,image});

        res.status(statusCode.OK).json({success:true,message:'Banner added successfully'})
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:error.message});
    }
};