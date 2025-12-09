const Category=require("../../models/category");

const getAllCategories=async(page=1,limit=4,search="")=>{
    try {
        const query={
            $or:[
                {name:{$regex:".*"+search+".*",$options:"i"}},
                {description:{$regex:".*"+search+".*",$options:"i"}}
            ]
        };

        const categories= await Category.find(query)
        .sort({created:-1})
        .limit(limit)
        .skip((page-1)*limit)
        .exec();
        const count=await Category.countDocuments(query);
        return {
        categories,
        totalPages:Math.ceil(count/limit),
        currentPage:page,
        count
        };
    } catch (error) {
        throw new("Error fetching categories:",error);
    }
};


const createCategory = async (data)=> {
    try {
const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${data.name}$`, "i") }
        });
        if (existingCategory) {
            return { success: false, message: "Category already exists" };
        }
const newCategory = new Category({
            name: data.name,
            description: data.description,
            isListed: true
        });
        await newCategory.save();
        return { success: true, message: "Category created successfully" };
    } catch (error) {
        throw new Error("Error creating category: " + error.message);
    }
};
module.exports={
getAllCategories,
createCategory
}


