const {
  getAllProducts,
  getCateAndBrands,
  createProduct,
  toggleProductListing
} = require("../../services/adminSer/productServices");

const getProductList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";

    const data = await getAllProducts(page, 10, search);

    res.render("productMang", {
      products: data.products,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalProducts: data.totalProducts,
      activePage: "products",
      search: search,
    });
  } catch (error) {
    console.error("Error in getproductList:", error);
    res.status(500).send("Server Error");
  }
};

const toggleListing = async (req, res) => {
  try {
    const result = await toggleProductListing(req.query.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error toggling product listing:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAddProduct = async (req, res) => {
  try {
    const { categories, brands } = await getCateAndBrands();

    res.render("addProduct", { categories, brands, activePage: 'products' });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal error");
  }
};



const addProducts = async (req, res) => {
  try {
    console.log("Received product data:", req.body);
    await createProduct(req.body);
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error in addProducts:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, message: "server error", error: error.message });
  }
}

const getEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const Product = require("../../models/product");
    const { categories, brands } = await getCateAndBrands();

    const product = await Product.findById(id)
      .populate("categoryId")
      .populate("brandId");

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("editProduct", {
      product,
      categories,
      brands,
      activePage: 'products'
    });
  } catch (error) {
    console.error("Error getting edit product:", error);
    res.status(500).send("Internal error");
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, brand } = req.body;

    const Product = require("../../models/product");
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    product.name = name;
    product.description = description;
    product.categoryId = category;
    product.brandId = brand;

    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Internal error");
  }
};

module.exports = {
  getProductList,
  toggleListing,
  getAddProduct,
  addProducts,
  getEditProduct,
  updateProduct
};
