async function placeOrder() {
    // 1. Get Address & Payment... (Same as before)
    const addressInput = document.querySelector("input[name=\"selectedAddress\"]:checked");
    if (!addressInput) return Swal.fire("Warning", "Select Address", "warning");



    const paymentInput = document.querySelector("input[name=\"paymentMethod\"]:checked");
    const paymentMethod = paymentInput ? paymentInput.value : "COD";




    const confirm = await Swal.fire({
        title: "Place Order?",
        text: `Confirm order with ${paymentMethod}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes"
    });

    if (!confirm.isConfirmed) return;

    if (paymentMethod === "Online") {
        try {

            const response = await axios.post("/checkout/razorpay-order", {
                addressId: addressInput.value
            });
            if (!response.data.success) throw new Error("Failed to start payment");

            const orderData = response.data.order;


            const options = {
                "key": "rzp_test_S0ywJN5WPSnvu3",
                "amount": orderData.amount,
                "currency": "INR",
                "name": "Shoe Project",
                "description": "Purchase Order",
                "order_id": orderData.id,
                "handler": async function (response) {

                    await submitFinalOrder(addressInput.value, "Online", response);
                },
                "modal": {
                    "ondismiss": function () {
                        window.location.href = `/checkout/payment-failure?razorpay_order_id=${orderData.id}&message=Payment Cancelled`;
                    }
                },
                "prefill": {
                    "name": "User Name",
                    "email": "user@example.com"
                },
                "theme": { "color": "#3399cc" }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

            rzp1.on("payment.failed", function (response) {
                window.location.href = `/checkout/payment-failure?razorpay_order_id=${orderData.id}&message=Payment Failed`;
            });

        } catch (error) {
         console.error(error);
  
    const serverMessage = error.response?.data?.message || "Payment initialization failed";
    Swal.fire("Error", serverMessage, "error");
        }
        return;
    }


    await submitFinalOrder(addressInput.value, paymentMethod);
}


async function submitFinalOrder(addressId, paymentMethod, paymentDetails = {}) {


    try {
        console.log("DEBUG: Sending place-order request...", { addressId, paymentMethod });
        const response = await axios.post("/checkout/place-order", {
            addressId,
            paymentMethod,
            paymentDetails
        });
        console.log("DEBUG: place-order response received:", response.data);
        if (response.data.success) {
            window.location.href = `/order-success/${response.data.orderId}`;
        }
    } catch (error) {
        console.error("DEBUG: submitFinalOrder catch hit!", error);
        const message = error.response?.data?.message || "Failed to place order";
        console.log("DEBUG: Error message from server:", message);

        if (paymentMethod === "Online") {
            console.log("DEBUG: Online payment failed, redirecting to failure page...");
            window.location.href = "/checkout/payment-failure?message=" + encodeURIComponent(message);
        } else {
            Swal.fire("Failed", message, "error");
        }
    }
}


/* COUPON FUNCTIONS */
async function applyCoupon() {
    const codeInput = document.getElementById("couponCode");
    const code = codeInput.value.trim();
    if (!code) return Swal.fire("Error", "Please enter a coupon code", "error");

    try {
        const response = await axios.post("/checkout/apply-coupon", { code });
        if (response.data.success) {
            Swal.fire("Success", "Coupon Applied!", "success");
            // Update UI
            document.getElementById("applyBtn").style.display = "none";
            document.getElementById("removeBtn").style.display = "block";
            document.getElementById("couponCode").disabled = true;

            // Dynamic update without reload
            document.getElementById("discountAmount").innerText = response.data.discount;
            document.getElementById("totalAmount").innerText = "₹" + response.data.newTotal;
        }
    } catch (error) {
        Swal.fire("Invalid Coupon", error.response?.data?.message || "Error applying coupon", "error");
    }
}

async function removeCoupon() {
    try {
        const response = await axios.post("/checkout/remove-coupon");
        if (response.data.success) {
            Swal.fire("Removed", "Coupon removed", "info");

            // Update UI
            document.getElementById("applyBtn").style.display = "block";
            document.getElementById("removeBtn").style.display = "none";
            const codeInput = document.getElementById("couponCode");
            codeInput.disabled = false;
            codeInput.value = "";

            // Dynamic update without reload
            document.getElementById("discountAmount").innerText = "0";
            document.getElementById("totalAmount").innerText = "₹" + response.data.newTotal;
        }
    } catch (error) {
        Swal.fire("Error", "Could not remove coupon", "error");
    }
}
