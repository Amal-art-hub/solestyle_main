const Product = require("../../models/product");
const Variant = require("../../models/varient");
const Category = require("../../models/category");
const Brand = require("../../models/brand");

const getAllProducts = async (page = 1, limit = 10, search = "") => {
    try {
        const skip = (page - 1) * limit;
        const query = {}
                
        if (search) {
            query.name = { $regex: new RegExp(search, "i") };
        }


        // const userData = await User.find(query).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
        // const count = await User.find(query).countDocuments();



        const products = await Product.find(query)
            .populate("categoryId", "name")
            .populate("brandId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        return {
         
            products,
            currentPage: page,
            totalPages,
            totalProducts
        };


    } catch (error) {
        throw new Error("Error fetching products:" + error.message);
    }
};


const toggleProductListing = async (id) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            return { success: false, message: "Product not found" };
        }
        product.isListed = !product.isListed;
        await product.save();

        return {
            success: true,
            isListed: product.isListed,
            message: product.isListed ? "Product listed" : "Product unlisted"
        };
    } catch (error) {
        throw new Error("Error toggling product listing:" + error.message);
    }
}


const getCateAndBrands = async () => {
    try {
        const categories = await Category.find({ isListed: true });
        const brands = await Brand.find({ isListed: true });
        return { categories, brands };
    } catch (error) {
        console.log(error);
    }
}




const createProduct = async (Data) => {
    try {
        const { name, description, category, brand } = Data;


         const categoryData = await Category.findOne({ _id: category, isListed: true });
        const brandData = await Brand.findOne({ _id: brand, isListed: true });
        if (!categoryData) {
            throw new Error("This Category is Unlisted or Invalid. Cannot add product.");
        }
        if (!brandData) {
            throw new Error("This Brand is Unlisted or Invalid. Cannot add product.");
        }

        const newProduct = new Product({
            name,
            description,
            categoryId: category,
            brandId: brand
        });
        await newProduct.save();
        return newProduct;
    } catch (error) {
        throw new Error("Error creating product:" + error.message);
    }
}

module.exports = {
    getAllProducts,
    toggleProductListing,
    getCateAndBrands,
    createProduct
}