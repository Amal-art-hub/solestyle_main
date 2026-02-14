import {
    listOffers,
    getAddOfferService,
    createOfferService,
    getOfferById,
    updateOfferService,
    deleteOfferService
} from "../../services/adminSer/offerService.js";
import statusCode from "../../utils/statusCodes.js";

export const getOfferList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const search = req.query.search || "";

        const { offers, totalPages, currentPage } = await listOffers(page, limit, search);

        res.status(statusCode.OK).render("offerList", {
            offers,
            totalPages,
            currentPage,
            search,
            activePage: "offers"
        });

    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Error");
    }
};

export const getAddOffer = async (req, res) => {
    try {
        const { products, categories } = await getAddOfferService();
        res.status(statusCode.OK).render("addOfferPage", {
            products,
            categories,
            activePage: "offers"
        });
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Error");
    }
};

export const addOffer = async (req, res) => {
    try {
        await createOfferService(req.body);
        res.status(statusCode.OK).json({ success: true, message: "Offer created successfully" });
    } catch (error) {
        console.error("Error adding offer:", error);

        if (error.type === "CONFLICT") {
            return res.status(statusCode.CONFLICT).json({
                success: false,
                message: error.message,
                conflict: true
            });
        }

        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const getEditOffer = async (req, res) => {
    try {
        const offer = await getOfferById(req.params.id);
        const { products, categories } = await getAddOfferService();
        res.status(statusCode.OK).render("editOfferPage", {
            offer,
            products,
            categories,
            activePage: "offers"
        });

    } catch (error) {
        console.error("Error fetching offer for edit:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Error");
    }
};

export const updateOffer = async (req, res) => {
    try {
        await updateOfferService(req.params.id, req.body);

        res.status(statusCode.OK).json({ success: true, message: "Offer updated successfully" });
    } catch (error) {
        console.error("Error updating offer:", error);

        if (error.type === "CONFLICT") {
            return res.status(statusCode.CONFLICT).json({
                success: false,
                message: error.message,
                conflict: true
            });
        }

        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export const deleteOffer = async (req, res) => {
    try {
        await deleteOfferService(req.params.id);
        res.status(statusCode.OK).json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        console.error("Error deleting offer:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to delete offer" });
    }
};