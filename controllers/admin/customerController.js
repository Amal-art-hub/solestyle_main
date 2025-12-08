const { getCustomerData } = require("../../services/adminSer/customerServices");


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
            search: search

        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getCustomers
}