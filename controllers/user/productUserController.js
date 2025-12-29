
const {
    getProductsByCategory,
    getProductDetailService,

} = require("../../services/userSer/productUserServices");
const statusCode = require("../../utils/statusCodes.js");


const getMensProducts = async (req, res) => {
    try {
        const categoryId = req.query.category;

        // Fix 1: Check correct variable
        if (!categoryId) {
            return res.redirect("/");
        }

        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const sort = req.query.sort || "newest";

        const filters = { // Fix 2: Renamed to plural to match usage
            brand: req.query.brand,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice
        };

        // Fix 3: Added await
        const data = await getProductsByCategory(categoryId, page, 12, search, sort, filters);

        // Fix 4: Correct object syntax for render
        res.render("mensProducts", {
            ...data,
            search,
            sort,
            filters,
            categoryId,
            user: req.session.user || null
        });

    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}


const getProductDetails = async (req, res) => {
    try {
        const data = await getProductDetailService(req.params.id);
        if (!data) return res.redirect("/");

        res.render("productDetails", {
            product: data.product,
            variants: data.variants,
            relatedProducts: data.relatedProducts,
            // currentVariant: data.variants[0],
                        currentVariant: req.query.variantId 
                ? data.variants.find(v => v._id.toString() === req.query.variantId) || data.variants[0] 
                : data.variants[0],
            reviews: data.reviews,      // <--- Add this
            avgRating: data.avgRating,
            user: req.session.user

        });
    } catch (error) {
        console.error(error);
        res.status(statusCode.BAD_REQUEST).send("Server error");
    }
}



const getWomenProducts = async (req, res) => {
    try {
        const categoryId = req.query.category;

        // Fix 1: Check correct variable
        if (!categoryId) {
            return res.redirect("/");
        }

        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const sort = req.query.sort || "newest";

        const filters = { // Fix 2: Renamed to plural to match usage
            brand: req.query.brand,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice
        };

        // Fix 3: Added await
        const data = await getProductsByCategory(categoryId, page, 12, search, sort, filters);

        // Fix 4: Correct object syntax for render
        res.render("mensProducts", {
            ...data,
            search,
            sort,
            filters,
            categoryId,
            user: req.session.user || null
        });

    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}




const getKidsProducts = async (req, res) => {
    try {
        const categoryId = req.query.category;

        // Fix 1: Check correct variable
        if (!categoryId) {
            return res.redirect("/");
        }

        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const sort = req.query.sort || "newest";

        const filters = { // Fix 2: Renamed to plural to match usage
            brand: req.query.brand,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice
        };

        // Fix 3: Added await
        const data = await getProductsByCategory(categoryId, page, 12, search, sort, filters);

        // Fix 4: Correct object syntax for render
        res.render("mensProducts", {
            ...data,
            search,
            sort,
            filters,
            categoryId,
            user: req.session.user || null
        });

    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
    }
}









module.exports = {
    getMensProducts,
    getProductDetails,
    getWomenProducts,
    getKidsProducts,


}