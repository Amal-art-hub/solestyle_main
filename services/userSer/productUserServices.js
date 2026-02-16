import Product from "../../models/product.js";
import Variant from "../../models/varient.js";
import Brand from "../../models/brand.js";
import Category from "../../models/category.js";
import Feedback from "../../models/feedback.js";
import Offers from "../../models/offers.js";
import mongoose from "mongoose";

export const getFilterOptions = async () => {
    const brands = await Brand.find({ isListed: true }).sort({ name: 1 });
    return { brands };
};

export const calculateFinalPrice = async (product, originalPrice, activeOffers = null) => {
    const today = new Date();

    if (!activeOffers) {
        activeOffers = await Offers.find({
            status: "active",
            start_date: { $lte: today },
            end_date: { $gte: today }
        });
    }

    let bestDiscount = 0;
    let isExpiringSoon = false;

    for (const offer of activeOffers) {
        let matchFound = false;

        // Check Product Match
        if (offer.type === "product" && offer.product_ids.some(id => id.toString() === product._id.toString())) {
            matchFound = true;
        }

        // Check Category Match
        const catId = product.categoryId._id ? product.categoryId._id.toString() : product.categoryId.toString();
        if (offer.type === "category" && offer.category_ids.map(id => id.toString()).includes(catId)) {
            matchFound = true;
        }

        // Use the highest discount and check if it expires soon
        if (matchFound && offer.discount_percentage > bestDiscount) {
            bestDiscount = offer.discount_percentage;

            // Check if THIS offer ends in less than 24 hours
            if (offer.end_date - today <= 24 * 60 * 60 * 1000) {
                isExpiringSoon = true;
            } else {
                isExpiringSoon = false;
            }
        }
    }

    if (bestDiscount > 0) {
        const discountAmount = (originalPrice * bestDiscount) / 100;
        const finalPrice = Math.round(originalPrice - discountAmount);
        return { finalPrice, bestDiscount, isExpiringSoon };
    }

    return { finalPrice: originalPrice, bestDiscount: 0, isExpiringSoon: false };
};

export const getProductsByCategory = async (categoryId, page = 1, limit = 12, search = "", sort = "newest", filters = {}) => {
    const skip = (page - 1) * limit;

    let matchStage = {
        isListed: true,
        categoryId: new mongoose.Types.ObjectId(categoryId)
    };

    if (search) {
        const matchingBrands = await Brand.find({
            name: { $regex: search, $options: "i" },
            isListed: true
        }).select("_id");

        const matchingBrandIds = matchingBrands.map(b => b._id);

        matchStage.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { brandId: { $in: matchingBrandIds } }
        ];
    }

    if (filters.brand) {
        const brandIds = Array.isArray(filters.brand)
            ? filters.brand.map(id => new mongoose.Types.ObjectId(id))
            : [new mongoose.Types.ObjectId(filters.brand)];

        matchStage.brandId = { $in: brandIds };
    }

    let sortStage = {};
    if (sort === "price-low") {
        sortStage["variantDetails.price"] = 1;
    } else if (sort === "price-high") {
        sortStage["variantDetails.price"] = -1;
    } else if (sort === "a-z") {
        sortStage["name"] = 1;
    } else if (sort === "z-a") {
        sortStage["name"] = -1;
    } else {
        sortStage["createdAt"] = -1;
    }

    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "variants",
                let: { pid: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$productId", "$$pid"] },
                                    { $eq: ["$isListed", true] }
                                ]
                            }
                        }
                    },
                    { $sort: { price: 1 } },
                    { $limit: 1 }
                ],
                as: "variantDetails"
            }
        },
        { $unwind: "$variantDetails" },
        ...(filters.minPrice || filters.maxPrice ? [{
            $match: {
                "variantDetails.price": {
                    ...(filters.minPrice ? { $gte: parseFloat(filters.minPrice) } : {}),
                    ...(filters.maxPrice ? { $lte: parseFloat(filters.maxPrice) } : {})
                }
            }
        }] : []),
        { $sort: sortStage },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    { $lookup: { from: "brands", localField: "brandId", foreignField: "_id", as: "brandId" } },
                    { $unwind: "$brandId" },
                    { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" } },
                    { $unwind: "$categoryId" }
                ]
            }
        }
    ];

    const result = await Product.aggregate(pipeline);

    const metadata = result[0].metadata;
    const totalProducts = metadata.length > 0 ? metadata[0].total : 0;
    const products = result[0].data;

    const today = new Date();
    const activeOffers = await Offers.find({
        status: "active",
        start_date: { $lte: today },
        end_date: { $gte: today }
    });

    const processedProducts = await Promise.all(products.map(async (p) => {
        const variant = p.variantDetails;
        const { finalPrice, bestDiscount, isExpiringSoon } = await calculateFinalPrice(p, variant.price, activeOffers);

        return {
            ...p,
            image: (variant.images && variant.images.length >= 3) ? variant.images[2] : (variant.images[0] || "default.jpg"),
            price: finalPrice,
            originalPrice: variant.price,
            discount: bestDiscount,
            stock: variant.stock,
            variantId: variant._id,
            isExpiringSoon: isExpiringSoon
        };
    }));

    return {
        products: processedProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        filterOptions: await getFilterOptions()
    };
};

export const getProductDetailService = async (productId) => {
    const product = await Product.findOne({ _id: productId, isListed: true })
        .populate("brandId")
        .populate("categoryId")
        .lean();

    if (!product) return null;

    // Fetch offers once
    const activeOffers = await Offers.find({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        isListed: true
    }).lean();

    let variants = await Variant.find({ productId: product._id, isListed: true }).sort({ price: 1 }).lean();

    variants = await Promise.all(variants.map(async (v) => {
        const { finalPrice, bestDiscount } = await calculateFinalPrice(product, v.price, activeOffers);
        return {
            ...v,
            discountedPrice: finalPrice,
            basePrice: v.price,
            offerPercentage: bestDiscount
        };
    }));

    const related = await Product.find({
        categoryId: product.categoryId._id,
        _id: { $ne: product._id },
        isListed: true
    }).limit(4).lean();

    if (related.length === 0) {
        return { product, variants, relatedProducts: [], reviews: [], avgRating: 0 };
    }

    // Batch fetch variants for related products
    const relatedIds = related.map(p => p._id);
    const relatedVariants = await Variant.find({
        productId: { $in: relatedIds },
        isListed: true
    }).sort({ price: 1 }).lean();

    // Group related variants by productId
    const relatedVariantMap = relatedVariants.reduce((acc, v) => {
        const pid = v.productId.toString();
        if (!acc[pid]) acc[pid] = v;
        return acc;
    }, {});

    const relatedWithImage = await Promise.all(related.map(async (p) => {
        const v = relatedVariantMap[p._id.toString()];
        if (!v) return null;

        const basePrice = v.price || 0;
        const { finalPrice, bestDiscount } = await calculateFinalPrice(p, basePrice, activeOffers);
        return {
            ...p,
            image: v.images[2] || v.images[0],
            price: finalPrice,
            originalPrice: basePrice,
            discount: bestDiscount,
            variantId: v._id
        };
    }));
    const filteredRelated = relatedWithImage.filter(p => p !== null);

    const reviews = await Feedback.find({ product_id: product._id })
        .populate("user_id", "name")
        .sort({ createdAt: -1 })
        .lean();

    let avgRating = 0;
    if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = (sum / reviews.length).toFixed(1);
    }
    return { product, variants, relatedProducts: filteredRelated, reviews, avgRating };
};

export const getTrendingProducts = async () => {
    const fetchByCategory = async (categoryName) => {
        const category = await Category.findOne({ name: categoryName, isListed: true });
        if (!category) return [];

        const products = await Product.find({ categoryId: category._id, isListed: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        if (products.length === 0) return [];

        // Batch fetch ONE variant for each product to find the best price/image
        const productIds = products.map(p => p._id);
        const variants = await Variant.find({
            productId: { $in: productIds },
            isListed: true
        }).sort({ price: 1 }).lean();

        // Group variants by productId
        const variantMap = variants.reduce((acc, v) => {
            const pid = v.productId.toString();
            if (!acc[pid]) acc[pid] = v; // First one (cheapest due to sort)
            return acc;
        }, {});

        const processed = products.map(p => {
            const variant = variantMap[p._id.toString()];
            if (variant) {
                return {
                    ...p,
                    image: (variant.images && variant.images.length >= 3) ? variant.images[2] : (variant.images[0] || "default.jpg"),
                    price: variant.price,
                    offerPrice: variant.offerPrice
                };
            }
            return null;
        });

        return processed.filter(p => p !== null).slice(0, 3);
    };

    const [men, women, kids] = await Promise.all([
        fetchByCategory("Men"),
        fetchByCategory("Women"),
        fetchByCategory("Kids")
    ]);

    return { men, women, kids };
};