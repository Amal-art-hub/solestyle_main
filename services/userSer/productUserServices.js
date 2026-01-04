
const User = require("../../models/user");
const Product = require('../../models/product');
const Variant = require('../../models/varient');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Feedback = require('../../models/feedback');
const Offers=require("../../models/offers");





const getFilterOptions = async () => {
    const brands = await Brand.find({ isListed: true }).sort({ name: 1 });
    return { brands };
};




const calculateFinalPrice = async (product, originalPrice) => {
    const today = new Date();


    const activeOffers = await Offers.find({
        status: 'active',
        start_date: { $lte: today },
        end_date: { $gte: today }
    });

    let bestDiscount = 0;


    for (const offer of activeOffers) {
        
        if (offer.type === 'product' && offer.product_ids.includes(product._id)) {
            if (offer.discount_percentage > bestDiscount) {
                bestDiscount = offer.discount_percentage;
            }
        }
      
        const catId = product.categoryId._id ? product.categoryId._id.toString() : product.categoryId.toString();
        
        if (offer.type === 'category' && offer.category_ids.map(id => id.toString()).includes(catId)) {
            if (offer.discount_percentage > bestDiscount) {
                bestDiscount = offer.discount_percentage;
            }
        }
    }

  
    if (bestDiscount > 0) {
        const discountAmount = (originalPrice * bestDiscount) / 100;
        const finalPrice = Math.round(originalPrice - discountAmount);
        return { finalPrice, bestDiscount };
    }

    
    return { finalPrice: originalPrice, bestDiscount: 0 };
};

const getProductsByCategory = async (categoryId, page = 1, limit = 12, search = '', sort = 'newest', filters = {}) => {
    try {
        const skip = (page - 1) * limit;

        let query = {
            isListed: true,
            categoryId: categoryId
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (filters.brand) {
            query.brandId = filters.brand;
        }

        let mongoSort = { createdAt: -1 };
        if (sort === "a-z") mongoSort = { name: 1 };
        if (sort === "z-a") mongoSort = { name: -1 };

        const products = await Product.find(query)
            .populate("brandId")
            .populate("categoryId")
            .sort(mongoSort)
            .lean();

        let processedProducts = await Promise.all(products.map(async (p) => {
            const variants = await Variant.find({ productId: p._id, isListed: true }).sort({ price: 1 });

            if (!variants.length) return null; 
            const basePrice = variants[0].price;
            const { finalPrice, bestDiscount } = await calculateFinalPrice(p, basePrice);
            return {
                ...p,
                image: variants[0].images[2], 
                price: finalPrice,  
                originalPrice: basePrice,   
                discount: bestDiscount,
                stock: variants.reduce((acc, v) => acc + v.stock, 0) 
            };
        }));
       
        processedProducts = processedProducts.filter(p => p !== null);
        
        if (filters.minPrice || filters.maxPrice) {
            const min = parseFloat(filters.minPrice) || 0;
            const max = parseFloat(filters.maxPrice) || Infinity;
            processedProducts = processedProducts.filter(p => p.price >= min && p.price <= max);
        }
        
        if (sort === 'price-low') {
            processedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            processedProducts.sort((a, b) => b.price - a.price);
        }
    
        const totalProducts = processedProducts.length;
        const finalProducts = processedProducts.slice(skip, skip + limit);
        return {
            products: finalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            filterOptions: await getFilterOptions()
        };





    } catch (error) {
        throw error;
    }
}



const getProductDetailService = async (productId) => {


    const product = await Product.findOne({ _id: productId, isListed: true })
        .populate("brandId")
        .populate("categoryId")
        .lean();

    if (!product) return null;
    let variants = await Variant.find({ productId: product._id, isListed: true }).sort({ price: 1 }).lean();

      variants = await Promise.all(variants.map(async (v) => {
        const { finalPrice, bestDiscount } = await calculateFinalPrice(product, v.price);
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

    const relatedWithImage = await Promise.all(related.map(async (p) => {
        const v = await Variant.findOne({ productId: p._id }).sort({ price: 1 });
        const basePrice = v?.price || 0;
        const { finalPrice, bestDiscount } = await calculateFinalPrice(p, basePrice);
        return { ...p,
             image: v?.images[2],
              price: finalPrice,
            originalPrice: basePrice,
            discount: bestDiscount,
              variantId: v?._id };
    }));



    const reviews = await Feedback.find({ product_id: product._id })
        .populate('user_id', 'name')
        .sort({ createdAt: -1 })
        .lean();


    let avgRating = 0;
    if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = (sum / reviews.length).toFixed(1);
    }
    return { product, variants, relatedProducts: relatedWithImage, reviews, avgRating };


}


const getTrendingProducts = async () => {
    try {
       
        const fetchByCategory = async (categoryName) => {
            
            const category = await Category.findOne({ name: categoryName, isListed: true });
            if (!category) return [];
            const products = await Product.find({ categoryId: category._id, isListed: true })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();
            
            const processed = await Promise.all(products.map(async (p) => {
                const variant = await Variant.findOne({ productId: p._id, isListed: true }).sort({ price: 1 });
                if (variant) {
                    return {
                        ...p,
                        image: variant.images[2],
                        price: variant.price,
                        offerPrice: variant.offerPrice
                    };
                }
                return null;
            }));

            return processed.filter(p => p !== null);
        };
        
        const [men, women, kids] = await Promise.all([
            fetchByCategory('Men'),   
            fetchByCategory('Women'),
            fetchByCategory('Kids')
        ]);
  
        return { men, women, kids };
    } catch (error) {
        throw error;
    }
}





module.exports = {
    getProductsByCategory,
    getProductDetailService,
    getTrendingProducts,

}