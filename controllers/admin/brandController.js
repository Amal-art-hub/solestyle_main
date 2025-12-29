const {
    getAllBrands,
    createBrand,
    toggleBrandStatus,
    editBrand
} = require("../../services/adminSer/brandServices");
const statusCode = require("../../utils/statusCodes.js");


const getBrandPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const data = await getAllBrands(page, 4, search);

        res.render("BrandManag", {
            data: data.brands,
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            activePage: "brands",
            search: search
        });
    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
    }
};

const addBrand = async (req, res) => {
    try {
        // req.body.name is available
        const result = await createBrand(req.body.name);
        if (!result.success) {
            return res.status(statusCode.BAD_REQUEST).json(result);
        }
        res.status(statusCode.OK).json(result);
    } catch (error) {
        // console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
};

const editBrandController = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const result = await editBrand(id, name, description);
        if (!result.success) {
            return res.status(statusCode.BAD_REQUEST).json(result);
        }
        res.status(statusCode.OK).json(result);
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
};

const blockBrand = async (req, res) => {
    try {
        await toggleBrandStatus(req.query.id);
        res.status(statusCode.OK).json({ success: true, message: "Brand status updated" });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error blocking brand" });
    }
};

module.exports = {
    getBrandPage,
    addBrand,
    editBrand: editBrandController,
    blockBrand
};