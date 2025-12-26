const cancelOrderItem = async (orderId, itemId) => {
    const { value: reason } = await Swal.fire({
        title: 'Cancel this item?',
        text: "Please provide a reason for cancellation:",
        input: 'text',
        inputPlaceholder: 'Reason (optional)',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel Item'
    });
    if (reason !== undefined) {
        try {
            const response = await fetch(`/user/orders/cancel-item/${orderId}/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason || "Changed mind" })
            });
            const result = await response.json();
            if (result.success) {
                Swal.fire('Canceled!', 'Item has been canceled.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error', result.message || 'Could not cancel item', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    }
};

async function returnOrderItem(orderId, itemId) {
    const { value: reason } = await Swal.fire({
        title: 'Return Item?',
        text: "Please provide a reason for return:",
        input: 'text',
        inputPlaceholder: 'Reason is required',
        showCancelButton: true,
        confirmButtonText: 'Submit Return Request',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write a reason!'
            }
        }
    });

    if (reason) {
        try {
            const response = await fetch(`/user/orders/return-item/${orderId}/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason })
            });
            
            const data = await response.json();
            
            if (data.success) {
                Swal.fire('Submitted!', 'Return request submitted.', 'success')
                .then(() => location.reload());
            } else {
                Swal.fire('Error', data.message || 'Could not return item', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Something went wrong!', 'error');
        }
    }
}

const cancelOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
        title: 'Cancel Entire Order?',
        text: "Are you sure? This will cancel all items in this order.",
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'Reason for cancellation',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel Order!'
    });

    if (reason !== undefined) {
        try {
            const response = await fetch(`/user/orders/cancel/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason || "User cancelled full order" })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire('Canceled!', 'Order has been canceled.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error', result.message || 'Could not cancel order', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    }
};

const returnOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
        title: 'Return Entire Order?',
        text: "Are you sure? This will return all items in this order.",
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'Reason for return',
        showCancelButton: true,
        confirmButtonColor: '#f39c12',
        confirmButtonText: 'Yes, Return Order'
    });

    if (reason) {
        try {
            const response = await fetch(`/user/orders/return/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire('Returned!', 'Order return request submitted.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error', result.message || 'Could not return order', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    }
};