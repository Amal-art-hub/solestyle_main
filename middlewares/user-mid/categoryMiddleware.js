
const Category = require('../../models/category');
const loadCategories = async (req, res, next) => {
  try {
    // Fetch categories meant for the header
    const menCategory = await Category.findOne({ name: 'Men', isListed: true });
    const womenCategory = await Category.findOne({ name: 'Women', isListed: true });
    const kidsCategory = await Category.findOne({ name: 'Kids', isListed: true });

    // Store IDs in res.locals (accessible in all EJS views)
    res.locals.menCategoryId = menCategory?._id || '';
    res.locals.womenCategoryId = womenCategory?._id || '';
    res.locals.kidsCategoryId = kidsCategory?._id || '';

    next();
  } catch (error) {
    console.error('Category Middleware Error:', error);
    next();
  }
};
module.exports = { loadCategories };