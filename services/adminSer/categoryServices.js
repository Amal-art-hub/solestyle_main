const Category = require("../../models/category");

const getAllCategories = async (page = 1, limit = 4, search = "") => {
  try {
    const query = {
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { description: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    };

    const categories = await Category.find(query)
      .sort({ created: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
    const count = await Category.countDocuments(query);
    return {
      categories,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count,
    };
  } catch (error) {
    throw new ("Error fetching categories:", error)();
  }
};

const createCategory = async (data) => {
  try {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
    });
    if (existingCategory) {
      return { success: false, message: "Category already exists" };
    }
    const newCategory = new Category({
      name: data.name,
      description: data.description,
      isListed: true,
    });
    await newCategory.save();
    return { success: true, message: "Category created successfully" };
  } catch (error) {
    throw new Error("Error creating category: " + error.message);
  }
};


const editCategoryService=async(data)=>{
    try {
        const {id,name,description}=data;
        const existingCategory=await Category.findOne({
            name:{$regex:new RegExp(`^${name}$`,"i")},
            _id:{$ne:id}
        });
        if(existingCategory){
            return {success:false,message:"Category name already taken"};
        }
        await Category.findByIdAndUpdate(id,{
            name:name,
            description:description
        });
        return {success:true,message:"Category updated successfully"};
    } catch (error) {
        throw new Error("Error updating category:",error.message);
    }
};

const toggleCategoryStatus=async(id)=>{
    try {
    const category=await Category.findById(id);
    if(!category)return {success:false,message:"Category not found"};
    category.isListed=!category.isListed;
    await category.save();
    return {success:true,status:category.isListed};

    } catch (error) {
     throw new Error("Error toggling status:"+error.message);        
    }
}


module.exports = {
  getAllCategories,
  createCategory,
  editCategoryService,
  toggleCategoryStatus
};
