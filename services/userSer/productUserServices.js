

const Product = require('../../models/product');
const Variant = require('../../models/varient');
const Brand = require('../../models/brand');
const Category = require('../../models/category');



const getFilterOptions = async () => {
    const brands = await Brand.find({ isListed: true }).sort({ name: 1 });
    return { brands };
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

            if (!variants.length) return null; // Skip if no variants

            return {
                ...p,
                image: variants[0].images[2], // First image of cheapest variant
                price: variants[0].price,     // Starts at this price
                stock: variants.reduce((acc, v) => acc + v.stock, 0) // Total stock
            };
        }));
        // Filter out nulls (products with no variants)
        processedProducts = processedProducts.filter(p => p !== null);
        // 7. Apply Price Filter (Done in JS because price is in Variant)
        if (filters.minPrice || filters.maxPrice) {
            const min = parseFloat(filters.minPrice) || 0;
            const max = parseFloat(filters.maxPrice) || Infinity;
            processedProducts = processedProducts.filter(p => p.price >= min && p.price <= max);
        }
        // 8. Apply Price Sorting (Done in JS)
        if (sort === 'price-low') {
            processedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            processedProducts.sort((a, b) => b.price - a.price);
        }
        // 9. Manual Pagination (since we filtered array in JS)
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

    const product = await Product.findById(productId)
        .populate("brandId")
        .populate("categoryId")
        .lean();

    if (!product) return null;
    const variants = await Variant.find({ productId: product._id, isListed: true }).sort({ price: 1 }).lean();

    const related = await Product.find({
        categoryId: product.categoryId._id,
        _id: { $ne: product._id },
        isListed: true

    }).limit(4).lean();

    const relatedWithImage = await Promise.all(related.map(async (p) => {
        const v = await Variant.findOne({ productId: p._id }).sort({ price: 1 });
        return { ...p, image: v?.images[2], price: v?.price };
    }));

    return { product, variants, relatedProducts: relatedWithImage };


}


const getTrendingProducts = async () => {
    try {
        // Helper to fetch 3 products from a specific category
        const fetchByCategory = async (categoryName) => {
            // Find the category ID first
            const category = await Category.findOne({ name: categoryName, isListed: true });
            if (!category) return [];
            const products = await Product.find({ categoryId: category._id, isListed: true })
                .sort({ createdAt: -1 })
                .limit(3) // Limit to 3 items per column
                .lean();
            // Process variants for images/prices
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
        // Fetch all 3 categories in parallel
        const [men, women, kids] = await Promise.all([
            fetchByCategory('Men'),   // Ensure these names match your DB exactly
            fetchByCategory('Women'),
            fetchByCategory('Kids')
        ]);
        // Return an object with named arrays
        return { men, women, kids };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getProductsByCategory,
    getProductDetailService,
    getTrendingProducts
}