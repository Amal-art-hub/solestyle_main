async function placeOrder() {
    // 1. Get Address & Payment... (Same as before)
    const addressInput = document.querySelector('input[name="selectedAddress"]:checked');
    if (!addressInput) return Swal.fire('Warning', 'Select Address', 'warning');

    const paymentInput = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentInput ? paymentInput.value : 'COD';

    // IF ONLINE PAYMENT -> DIFFERENT FLOW
    if (paymentMethod === 'Online') {
        try {
            // A. Create Order on Server
            const response = await axios.post('/checkout/razorpay-order');
            if (!response.data.success) throw new Error('Failed to start payment');

            const orderData = response.data.order;

            // B. Open Razorpay Options
            const options = {
                "key": "rzp_test_S0ywJN5WPSnvu3", // Or fetch from server API if safer
                "amount": orderData.amount,
                "currency": "INR",
                "name": "Shoe Project",
                "description": "Purchase Order",
                "order_id": orderData.id, 
                "handler": async function (response) {
                    // C. Payment Success -> Place Actual Order
                    await submitFinalOrder(addressInput.value, 'Online', response);
                },
                  "modal": {
                    "ondismiss": function() {
                        Swal.fire('Payment Cancelled', 'You cancelled the payment process.', 'info');
                    }
                },
                "prefill": {
                    "name": "User Name", // You can inject these values
                    "email": "user@example.com"
                },
                "theme": { "color": "#3399cc" }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();
            
            rzp1.on('payment.failed', function (response){
                  window.location.href = '/checkout/payment-failure';
            });

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Payment initialization failed', 'error');
        }
        return; // STOP HERE, wait for payment
    }

    // IF COD OR WALLET -> NORMAL FLOW
    await submitFinalOrder(addressInput.value, paymentMethod);
}

// Separate function for final submission to reuse code
async function submitFinalOrder(addressId, paymentMethod, paymentDetails = {}) {
     const confirm = await Swal.fire({
        title: 'Place Order?',
        text: `Confirm order with ${paymentMethod}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes'
    });

    if (confirm.isConfirmed) {
        try {
            const response = await axios.post('/checkout/place-order', {
                addressId,
                paymentMethod,
                paymentDetails // Send razorpay_payment_id etc.
            });
            if (response.data.success) {
                 window.location.href = `/order-success/${response.data.orderId}`;
            }
        } catch (error) {
             Swal.fire('Failed', error.response?.data?.message, 'error');
        }
    }
}

/* COUPON FUNCTIONS */
async function applyCoupon() {
    const codeInput = document.getElementById('couponCode');
    const code = codeInput.value.trim();
    if (!code) return Swal.fire('Error', 'Please enter a coupon code', 'error');

    try {
        const response = await axios.post('/checkout/apply-coupon', { code });
        if (response.data.success) {
            Swal.fire('Success', 'Coupon Applied!', 'success');
            // Update UI
            document.getElementById('applyBtn').style.display = 'none';
            document.getElementById('removeBtn').style.display = 'block';
            document.getElementById('couponCode').disabled = true;
            location.reload(); // Reload to update totals (Simple way)
        }
    } catch (error) {
        Swal.fire('Invalid Coupon', error.response?.data?.message || 'Error applying coupon', 'error');
    }
}

async function removeCoupon() {
    try {
        const response = await axios.post('/checkout/remove-coupon');
        if (response.data.success) {
            Swal.fire('Removed', 'Coupon removed', 'info');
            location.reload();
        }
    } catch (error) {
        Swal.fire('Error', 'Could not remove coupon', 'error');
    }
}
