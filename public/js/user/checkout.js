async function placeOrder() {
    // 1. Get Selected Address
    const addressInput = document.querySelector('input[name="selectedAddress"]:checked');
    if (!addressInput) {
        Swal.fire({
            icon: 'warning',
            title: 'No Address Selected',
            text: 'Please select a delivery address to proceed.'
        });
        return;
    }
    const addressId = addressInput.value;
    // 2. Get Payment Method
    const paymentInput = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentInput ? paymentInput.value : 'COD';
    // 3. Confirm
    const confirm = await Swal.fire({
        title: 'Place Order?',
        text: `Confirm order with ${paymentMethod}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Place Order!'
    });
    if (confirm.isConfirmed) {
        try {
            // 4. Send Request
            // Show Loading
            Swal.fire({
                title: 'Processing...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
            const response = await axios.post('/checkout/place-order', {
                addressId: addressId,
                paymentMethod: paymentMethod
            });
            if (response.data.success) {
                // Success
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = `/order-success/${response.data.orderId}`;
                });
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Something went wrong';
            Swal.fire({
                icon: 'error',
                title: 'Order Failed',
                text: msg
            });
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
