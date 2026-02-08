// const { getAllBanners,
//     getBrandSection
// } = require("../../services/adminSer/bannerService");
// const statusCode = require("../../utils/statusCodes");


// const getBannerPagecont = async (req, res) => {
//     try {
//         const [banner, brandSection] = await Promise.all([getAllBanners(), getBrandSection()]);
//         res.render("banners", {
//             banners: banner,
//             brandSection: brandSection || {}
//         });
//     } catch (error) {
//         console.error("Error loading banners page:", error);
//         res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
//     }
// }

// module.exports = {
//     getBannerPagecont
// }