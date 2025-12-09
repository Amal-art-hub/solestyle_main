const { getAllCategories,
    createCategory
 } = require("../../services/adminSer/categoryServices");



const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const data = await getAllCategories(page, 4, search);

        res.render("CategoryManag", {
            cat: data.categories,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: search,
            activePage: "categories"
        })
    } catch (error) {
        console.log(error);
        res.redirect("/page-404");

    }
};

const addCategory=async(req,res)=>{
try {
    const result=await createCategory(req.body);
    if(!result.success){
        return res.status(400).json(result);

    }
    res.status(200).json(result);

    
} catch (error) {
    console.error(error);
    res.status(500).json({success:false,message:"Server error"});

}
}



module.exports = {
    categoryInfo,
    addCategory
}