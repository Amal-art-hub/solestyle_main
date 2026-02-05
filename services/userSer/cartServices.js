const Cart = require("../../models/cart");
const Product = require("../../models/product");
const Variant = require("../../models/varient");
const Wishlist = require("../../models/wishlist");
const MAX_QTY_PER_PERSON = 5;
const { calculateFinalPrice } = require("./productUserServices");



const getCart = async (userId) => {
    try {
        let cart = await Cart.findOne({ user_id: userId })
            .populate({
                path: 'items.variant_id',
                select: 'size color price stock'
            })
            .populate({
                path: 'items.product_id',
                select: 'name isDeleted isListed categoryId'
            });

        if (!cart) {

            return { items: [] };
        }



        cart = cart.toObject();
        // Loop through items to calculate REAL TIME offers
        if (cart.items && cart.items.length > 0) {
            for (const item of cart.items) {
                const product = item.product_id;
                const variant = item.variant_id;
                if (product && variant) {
                    const { finalPrice, bestDiscount } = await calculateFinalPrice(product, variant.price);

                    // Attach these new values to the item
                    item.finalPrice = finalPrice;
                    item.originalPrice = variant.price;
                    item.discountPercentage = bestDiscount;
                }
            }
        }
        return cart;

    } catch (error) {
        console.error("Service Error in getCart:", error);
        throw new Error("Could not fetch cart details");
    }
};

const addToCartService = async (userId, variantId, quantity) => {
    try {

        const variant = await Variant.findById(variantId).populate({
            path: 'productId',
            populate: { path: 'categoryId' }
        });

        console.log("Variant Found:", variant);
        if (!variant) throw new Error("Product variant not found");
        const product = variant.productId;
        const category = product.categoryId;


        const isProductBlocked = product.isDeleted || !product.isListed;
        const isCategoryBlocked = category.isDeleted || !category.isListed;
        if (isProductBlocked || isCategoryBlocked) {
            throw new Error("This product is currently unavailable for purchase");
        }

        if (variant.stock < quantity) {
            throw new Error(`Only ${variant.stock} items left in stock`);
        }

        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) {

            if (quantity > MAX_QTY_PER_PERSON) {
                throw new Error(`Limit exceed: Max ${MAX_QTY_PER_PERSON} items allowed per customer`);
            }
            cart = new Cart({
                user_id: userId,
                items: [{
                    product_id: product._id,
                    variant_id: variantId,
                    quantity: quantity,
                    price_at_addition: variant.price,
                    name_snapshot: product.name,
                    image_snapshot: variant.images[2]
                }]
            });
        } else {

            const itemIndex = cart.items.findIndex(item =>
                item.variant_id.toString() === variantId.toString()
            );
            if (itemIndex > -1) {

                const currentQty = cart.items[itemIndex].quantity;
                const newQty = currentQty + quantity;

                if (newQty > MAX_QTY_PER_PERSON) {
                    throw new Error(`You can only buy ${MAX_QTY_PER_PERSON} of these items`);
                }

                if (newQty > variant.stock) {
                    throw new Error(`Cannot add more. Only ${variant.stock} in stock.`);
                }
                cart.items[itemIndex].quantity = newQty;
            } else {

                if (quantity > MAX_QTY_PER_PERSON) {
                    throw new Error(`Limit exceed: Max ${MAX_QTY_PER_PERSON} items allowed per customer`);
                }
                cart.items.push({
                    product_id: product._id,
                    variant_id: variantId,
                    quantity: quantity,
                    price_at_addition: variant.price,
                    name_snapshot: product.name,
                    image_snapshot: variant.images[2]
                });
            }
        }
        await cart.save();

        await Wishlist.updateOne(
            { user_id: userId },
            { $pull: { products: { variantId: variantId } } }
        );

        return cart;
    } catch (error) {
        throw error;
    }
};



const updateQuantityService = async (userId, itemId, action) => {
    try {
        const cart = await Cart.findOne({ user_id: userId }).populate({
            path: 'items.variant_id',
            select: 'size color price stock'
        }).populate({
            path: 'items.product_id',
            select: 'name isDeleted isListed categoryId'
        });
        if (!cart) throw new Error("Cart not found");

        const item = cart.items.id(itemId);
        if (!item) throw new Error("Item not found in cart");

        if (!item.variant_id) {
            throw new Error("Product Variant no longer exists");
        }

        const variant = item.variant_id;

        // const variantCheck = await Variant.findById(item.variant_id._id);
        // if (!variantCheck) throw new Error("Product Variant no longer exists");

        let newQty = parseInt(item.quantity);
        if (action === "increment") newQty += 1;
        if (action === "decrement") newQty -= 1;


        if (newQty < 1) throw new Error("Quantity cannot be less than 1");

        if (newQty > MAX_QTY_PER_PERSON) {
            throw new Error(`Maximum limit is${MAX_QTY_PER_PERSON} per customer`);
        }

        if (newQty > variant.stock) {
            throw new Error(`Out of Stock! Only${variant.stock} available.`);
        }

        item.quantity = newQty;
        await cart.save();


        const validItems = cart.items.filter(item =>
            item.variant_id &&
            item.product_id &&
            item.variant_id.stock >= item.quantity &&
            !item.product_id.isDeleted &&
            item.product_id.isListed
        );



        let grandTotal = 0;
        let totalMRP = 0;


        // await Promise.all(validItems.map(async (item) => {
        //     if (item.variant_id && item.variant_id.price) {

        //         const { finalPrice } = await calculateFinalPrice(item.product_id, item.variant_id.price);
        //         grandTotal += item.quantity * finalPrice;
        //     }
        // }));


        await Promise.all(validItems.map(async (item) => {
            const { finalPrice } = await calculateFinalPrice(item.product_id, item.variant_id.price);
            grandTotal += (item.quantity * finalPrice);
            totalMRP += (item.quantity * item.variant_id.price);
        }));

        return {
            success: true,
            newQty: newQty,
            optTotal: grandTotal,
            totalSavings: totalMRP - grandTotal
        };

    } catch (error) {
        throw error;
    }
}


const removeItemService = async (userId, itemId) => {
    try {
        return await Cart.findOneAndUpdate(
            { user_id: userId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );
    } catch (error) {
        throw error;
    }
};


// const removeallItemsService = async (user_Id) => {
//     try {
//         return await Cart.findOneAndUpdate({ user_id: user_Id },
//             { $set: { items: [] } },
//             { new: true }
//         )
//     } catch (error) {
//         console.error("removing all by button problem:", error);
//     }
// }



module.exports = {
    getCart,
    addToCartService,
    updateQuantityService,
    removeItemService,
    // removeallItemsService
}