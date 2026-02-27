import {
    getProductsByCategory,
    getProductDetailService,
    getSearchSuggestions as getSuggestionsService
} from "../../services/userSer/productUserServices.js";
import statusCode from "../../utils/statusCodes.js";

export const shopCategory = async (req, res) => {
    try {
        const categoryId = req.query.category;

        if (!categoryId) {
            return res.redirect("/");
        }

        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const sort = req.query.sort || "newest";

        const filters = {
            brand: req.query.brand,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice
        };

        const data = await getProductsByCategory(categoryId, page, 12, search, sort, filters);

        res.status(statusCode.OK).render("mensProducts", {
            ...data,
            search,
            sort,
            filters,
            categoryId,
            // user: req.session.user || null
        });

    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
    }
};

export const getProductDetails = async (req, res) => {
    try {
        const data = await getProductDetailService(req.params.id);
        if (!data) return res.redirect("/");

                if (!data.product.categoryId.isListed) {
            // Redirect to shop with a message
            return res.redirect("/shop");
        }

        res.status(statusCode.OK).render("productDetails", {
            product: data.product,
            variants: data.variants,
            relatedProducts: data.relatedProducts,
            currentVariant: req.query.variantId
                ? data.variants.find(v => v._id.toString() === req.query.variantId) || data.variants[0]
                : data.variants[0],
            reviews: data.reviews,
            avgRating: data.avgRating,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(statusCode.BAD_REQUEST).send("Server error");
    }
};

// export const getWomenProducts = async (req, res) => {
//     try {
//         const categoryId = req.query.category;

//         if (!categoryId) {
//             return res.redirect("/");
//         }

//         const page = parseInt(req.query.page) || 1;
//         const search = req.query.search || "";
//         const sort = req.query.sort || "newest";

//         const filters = {
//             brand: req.query.brand,
//             minPrice: req.query.minPrice,
//             maxPrice: req.query.maxPrice
//         };

//         const data = await getProductsByCategory(categoryId, page, 12, search, sort, filters);

//         res.status(statusCode.OK).render("mensProducts", {
//             ...data,
//             search,
//             sort,
//             filters,
//             categoryId,
//             user: req.session.user || null
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
//     }
// };

// export const getKidsProducts = async (req, res) => {
//     try {
//         const categoryId = req.query.category;

//         if (!categoryId) {
//             return res.redirect("/");
//         }

//         const page = parseInt(req.query.page) || 1;
//         const search = req.query.search || "";
//         const sort = req.query.sort || "newest";

//         const filters = {
//             brand: req.query.brand,
//             minPrice: req.query.minPrice,
//             maxPrice: req.query.maxPrice
//         };

//         const data = await getProductsByCategory(categoryId, page, 12, search, sort, filters);

//         res.status(statusCode.OK).render("mensProducts", {
//             ...data,
//             search,
//             sort,
//             filters,
//             categoryId,
//             user: req.session.user || null
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
//     }
// };

export const getSearchSuggestions = async (req, res) => {
    try {
        const query = req.query.q;
        const suggestions = await getSuggestionsService(query);
        res.status(statusCode.OK).json({ success: true, suggestions });
    } catch (error) {
        console.error("Search Suggestion Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error fetching suggestions" });
    }
};