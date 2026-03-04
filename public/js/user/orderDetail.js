// Reusable function to refresh the entire order details area
const refreshOrderUI = async () => {
    const pathParts = window.location.pathname.split("/").filter(p => p);
    const orderId = pathParts[pathParts.length - 1];

    try {
        console.log(`[DEBUG] Refreshing Order #${orderId}...`);

        const response = await fetch(`/orders/${orderId}?t=${Date.now()}`, {
            method: "GET",
            headers: { "Accept": "text/html" }
        });

        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, "text/html");

            const newContent = newDoc.querySelector(".order-details-container");
            const currentContent = document.querySelector(".order-details-container");

            if (newContent && currentContent) {
                // Log the status of the first few items in the response for debugging
                const badges = Array.from(newDoc.querySelectorAll(".status-badge")).map(b => b.innerText.trim());
                console.log("[DEBUG] Status Badges in Response:", badges);

                // Robust replacement
                currentContent.replaceWith(newContent);
                console.log("[DEBUG] UI Updated Successfully.");
            } else {
                console.warn("[DEBUG] Container mismatch. Reloading...");
                location.reload();
            }
        }
    } catch (error) {
        console.error("[DEBUG] Sync Error:", error);
    }
};

// Auto-refresh in background to keep tracking line and statuses live
const startOrderStatusRefresh = () => {
    // Refresh every 15 seconds in background (less aggressive than before)
    setInterval(refreshOrderUI, 15000);
};


window.addEventListener("load", startOrderStatusRefresh);



const cancelOrderItem = async (orderId, itemId) => {
    const { value: reason } = await Swal.fire({
        title: "Cancel this item?",
        text: "Please provide a reason for cancellation:",
        input: "select",
        inputOptions: {
            "Changed Mind": "Changed Mind",
            "Ordered by Mistake": "Ordered by Mistake",
            "Found Cheaper Elsewhere": "Found Cheaper Elsewhere",
            "Shipping Too Slow": "Shipping is too slow",
            "Other": "Other"
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, Cancel Item",
        inputValidator: (value) => {
            if (!value) {
                return "You need to select a reason!";
            }
        }
    });
    if (reason !== undefined) {
        try {
            const response = await fetch(`/user/orders/cancel-item/${orderId}/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason || "Changed mind" })
            });
            const result = await response.json();
            if (result.success) {
                Swal.fire("Canceled!", "Item has been canceled.", "success");
                setTimeout(refreshOrderUI, 300); // Small delay for DB consistency
            } else {
                Swal.fire("Error", result.message || "Could not cancel item", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong", "error");
        }
    }
};

async function returnOrderItem(orderId, itemId) {
    const { value: reason } = await Swal.fire({
        title: "Return Item?",
        text: "Please provide a reason for return:",
        input: "select",
        inputOptions: {
            "Changed Mind": "Changed Mind",
            "Ordered by Mistake": "Ordered by Mistake",
            "Found Cheaper Elsewhere": "Found Cheaper Elsewhere",
            "Shipping Too Slow": "Shipping is too slow",
            "Other": "Other"
        },
        inputPlaceholder: "Select the reason",
        showCancelButton: true,
        confirmButtonText: "Submit Return Request",
        inputValidator: (value) => {
            if (!value) {
                return "You need to select a reason!";
            }
        }
    });

    if (reason) {
        try {
            const response = await fetch(`/user/orders/return-item/${orderId}/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire("Submitted!", "Return request submitted.", "success");
                setTimeout(refreshOrderUI, 300); // Small delay for DB consistency
            } else {
                Swal.fire("Error", data.message || "Could not return item", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong!", "error");
        }
    }
}

const cancelOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
        title: "Cancel Entire Order?",
        text: "Are you sure? This will cancel all items in this order.",
        icon: "warning",
        input: "select",
        inputOptions: {
            "Changed Mind": "Changed Mind",
            "Ordered by Mistake": "Ordered by Mistake",
            "Found Cheaper Elsewhere": "Found Cheaper Elsewhere",
            "Shipping Too Slow": "Shipping is too slow",
            "Other": "Other"
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, Cancel Order!",
        inputValidator: (value) => {
            if (!value) {
                return "You need to select a reason!";
            }
        }
    });

    if (reason !== undefined) {
        try {
            const response = await fetch(`/user/orders/cancel/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason || "User cancelled full order" })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire("Canceled!", "Order has been canceled.", "success");
                setTimeout(refreshOrderUI, 300); // Small delay for DB consistency
            } else {
                Swal.fire("Error", result.message || "Could not cancel order", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong", "error");
        }
    }
};

const returnOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
        title: "Return Entire Order?",
        text: "Are you sure? This will return all items in this order.",
        icon: "warning",
        input: "select",
        inputOptions: {
            "Changed Mind": "Changed Mind",
            "Ordered by Mistake": "Ordered by Mistake",
            "Found Cheaper Elsewhere": "Found Cheaper Elsewhere",
            "Shipping Too Slow": "Shipping is too slow",
            "Other": "Other"
        },
        inputPlaceholder: "Select a return",
        showCancelButton: true,
        confirmButtonColor: "#f39c12",
        confirmButtonText: "Yes, Return Order",
        inputValidator: (value) => {
            if (!value) {
                return "You need to select a reason!";
            }
        }
    });

    if (reason) {
        try {
            const response = await fetch(`/user/orders/return/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire("Returned!", "Order return request submitted.", "success");
                setTimeout(refreshOrderUI, 300); // Small delay for DB consistency
            } else {
                Swal.fire("Error", result.message || "Could not return order", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong", "error");
        }
    }
};


async function retryPayment(orderId) {
    try {
        const response = await axios.post("/retry-payment", { orderId: orderId });
        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to initiate retry payment");
        }

        const orderData = response.data.order;

        const options = {
            "key": "rzp_test_S0ywJN5WPSnvu3",
            "amount": orderData.amount,
            "currency": orderData.currency,
            "name": "Shoe Project",
            "description": "Retry Payment",
            "order_id": orderData.id,
            "handler": async function (paymentResponse) {
                try {
                    const verifyRes = await axios.post("/checkout/place-order", {
                        addressId: orderData.address_id || null,
                        paymentMethod: "Online",
                        paymentDetails: paymentResponse
                    });

                    if (verifyRes.data.success) {
                        window.location.href = `/order-success/${verifyRes.data.orderId}`;
                    }
                    else {
                        Swal.fire("Error", verifyRes.data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error", error.response?.data?.message || "Payment verification failed", "error");
                }
            },
            theme: { color: "#3399cc" }

        };
        const rzp = new Razorpay(options);
        rzp.open();


    } catch (error) {
        console.error(error);
        Swal.fire("Error", error.message || "Failed to initiate retry", "error");
    }
}