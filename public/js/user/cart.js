// 1. Update Quantity
async function updateQty(itemId, action) {
    try {
        const response = await axios.patch('/cart/update', {
            itemId: itemId,
            action: action
        });

        if (response.data.success) {
            // Success: Reload to show new price/total
            window.location.reload();
        }
    } catch (error) {
        // Error handling (Stock Limit, Max Qty, etc)
        const msg = error.response && error.response.data 
            ? error.response.data.message 
            : "Cannot update quantity";
            
        Swal.fire({
            icon: 'warning',
            title: 'Limit Reached',
            text: msg,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// 2. Remove Item
async function removeItem(itemId) {
    const result = await Swal.fire({
        title: 'Remove Item?',
        text: "Are you sure you want to remove this item?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.delete(`/cart/remove/${itemId}`);
            
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    showConfirmButton: false,
                    timer: 1000
                }).then(() => window.location.reload());
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to remove item', 'error');
        }
    }
}

// 3. Checkout
function proceedToCheckout() {
    window.location.href = '/checkout';
}