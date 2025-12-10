const { getCustomerData,
    blockCustomerById,
    unblockCoustomerById
 } = require("../../services/adminSer/customerServices");


const getCustomers = async (req, res) => {
    try {
        let search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        const limit = 10;

        const data = await getCustomerData(search, page, limit);
        res.render("customersManag", {
            data: data.userData,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: search,
            activePage: "users" 

        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const blockCustomer=async(req,res)=>{
  try {
    const id=req.query.id;
    await blockCustomerById(id);
    res.redirect("/admin/users")
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/users");
  }
}


const unblockCoustomer=async(req,res)=>{
    try {
        const id=req.query.id;
        await unblockCoustomerById(id);
        res.redirect("/admin/users");
    } catch (error) {
        console.log(error);
        res.redirect("/admin/users");
    }
}

module.exports = {
    getCustomers,
    blockCustomer,
    unblockCoustomer
}