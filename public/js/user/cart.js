// 1. Update Quantity
async function updateQty(itemId, action) {
    try {
        const response = await axios.patch("/cart/update", {
            itemId: itemId,
            action: action
        });

        if (response.data.success) {
            // A. Update the Quantity display for this specific item
            const qtyElement = document.getElementById(`qty-display-${itemId}`);
            if (qtyElement) {
                qtyElement.innerText = response.data.newQty;
            }

            // B. Update the Final Totals in the summary box
            const totalElement = document.getElementById("cart-total");
            const subtotalElement = document.getElementById("cart-subtotal");

            if (totalElement) totalElement.innerText = "₹" + response.data.cartTotal;
            if (subtotalElement) subtotalElement.innerText = "₹" + response.data.cartTotal;

            // C. Update the "Your Savings" section dynamically
            const savingsValue = response.data.totalSavings;
            const savingsRow = document.getElementById("savings-row");
            const savingsHr = document.getElementById("savings-hr");
            const savingsDisplay = document.getElementById("total-savings");

            if (savingsDisplay) {
                savingsDisplay.innerText = savingsValue;
            }

            // Toggle visibility of the savings row based on value
            if (savingsRow && savingsHr) {
                if (savingsValue > 0) {
                    savingsRow.style.display = "flex";
                    savingsHr.style.display = "block";
                } else {
                    savingsRow.style.display = "none";
                    savingsHr.style.display = "none";
                }
            }
        }
    } catch (error) {
        // Handle Errors (Out of Stock, Max Limit per person, etc.)
        const msg = error.response && error.response.data
            ? error.response.data.message
            : "Cannot update quantity";

        Swal.fire({
            icon: "warning",
            title: "Limit Reached",
            text: msg,
            position: "center",
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// 2. Remove Item from Cart
async function removeItem(itemId) {
    const result = await Swal.fire({
        title: "Remove Item?",
        text: "Are you sure you want to remove this item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!"
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.delete(`/cart/remove/${itemId}`);

            if (response.data.success) {
                // ✅ 1. REMOVE ITEM FROM DOM WITH ANIMATION
                const itemRow = document.getElementById(`item-row-${itemId}`);
                if (itemRow) {
                    itemRow.style.opacity = '0';
                    itemRow.style.transform = 'translateY(-20px)';
                    setTimeout(() => itemRow.remove(), 300);
                }

                // ✅ 2. UPDATE TOTALS AND SAVINGS
                const totalElement = document.getElementById("cart-total");
                const subtotalElement = document.getElementById("cart-subtotal");
                const headerCount = document.getElementById("header-item-count");
                const savingsDisplay = document.getElementById("total-savings");
                const savingsRow = document.getElementById("savings-row");
                const savingsHr = document.getElementById("savings-hr");

                if (totalElement) totalElement.innerText = "₹" + response.data.cartTotal;
                if (subtotalElement) subtotalElement.innerText = "₹" + response.data.cartTotal;
                if (headerCount) headerCount.innerText = response.data.itemCount + " Items";

                // ✅ 2.1 UPDATE HEADER CART ICON COUNT
                const cartIconBadge = document.getElementById("cart-badge-count");
                if (cartIconBadge) {
                    if (response.data.itemCount > 0) {
                        cartIconBadge.innerText = response.data.itemCount;
                    } else {
                        cartIconBadge.remove(); // Hide icon if 0
                    }
                }

                if (savingsDisplay) savingsDisplay.innerText = response.data.totalSavings;
                if (savingsRow && savingsHr) {
                    if (response.data.totalSavings > 0) {
                        savingsRow.style.display = "flex";
                        savingsHr.style.display = "block";
                    } else {
                        savingsRow.style.display = "none";
                        savingsHr.style.display = "none";
                    }
                }

                // ✅ 3. HANDLE EMPTY CART STATE
                if (response.data.itemCount === 0) {
                    const mainContent = document.getElementById("cart-main-content");
                    const emptyMsg = document.getElementById("empty-cart-msg");
                    if (mainContent) mainContent.style.display = "none";
                    if (emptyMsg) emptyMsg.style.display = "block";
                }

                Swal.fire({
                    icon: "success",
                    title: "Removed!",
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        } catch (error) {
            Swal.fire("Error", "Failed to remove item", "error");
        }
    }
}


function proceedToCheckout() {

    const loader = document.getElementById("global-page-loader");
    if (loader) {
        loader.classList.remove("fade-out");
    }


    window.location.href = "/checkout";
}


// async function clearFullChart(){
//     const confirm= await Swal.fire({
//         title:"This will remove everything from your cart!",
//         icon:"warning",
//           showCancelButton: true,
//         confirmButtonColor: '#d33',
//         confirmButtonText: 'Yes, clear it!'

//     });


//     if(confirm.isConfirmed){
//         try {
//             const response =await axios.delete("/user/cart/clear");

//             if(response.data.success){
//                 location.reload();
//             }
//         } catch (error) {
//             console.error("Error clearing cart");
//         }
//     }
// }