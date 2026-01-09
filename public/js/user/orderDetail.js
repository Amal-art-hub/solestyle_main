// Auto-refresh order status every 5 seconds
const startOrderStatusRefresh = () => {
    const orderId = window.location.pathname.split('/').pop();
    setInterval(async () => {
        try {
            const response = await fetch(`/user/orders/${orderId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const html = await response.text();
                // Parse the new HTML and update order details
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');
                
                // Update tracking section
                const newTrackingSection = newDoc.querySelector('.tracking-wrapper');
                const currentTrackingSection = document.querySelector('.tracking-wrapper');
                if (newTrackingSection && currentTrackingSection) {
                    currentTrackingSection.innerHTML = newTrackingSection.innerHTML;
                }
                
                // Update items section (left-col with order items)
                const newItemsSection = newDoc.querySelector('.left-col');
                const currentItemsSection = document.querySelector('.left-col');
                if (newItemsSection && currentItemsSection) {
                    currentItemsSection.innerHTML = newItemsSection.innerHTML;
                }
                
                // Update actions card (right side buttons)
                const newActionsCard = newDoc.querySelector('.actions-card');
                const currentActionsCard = document.querySelector('.actions-card');
                if (newActionsCard && currentActionsCard) {
                    currentActionsCard.innerHTML = newActionsCard.innerHTML;
                }
            }
        } catch (error) {
            console.error('Error refreshing order status:', error);
        }
    }, 5000); 
};


window.addEventListener('load', startOrderStatusRefresh);



const cancelOrderItem = async (orderId, itemId) => {
    const { value: reason } = await Swal.fire({
        title: 'Cancel this item?',
        text: "Please provide a reason for cancellation:",
        input: 'select',
        inputOptions: {
        'Changed Mind': 'Changed Mind',
        'Ordered by Mistake': 'Ordered by Mistake',
        'Found Cheaper Elsewhere': 'Found Cheaper Elsewhere',
        'Shipping Too Slow': 'Shipping is too slow',
        'Other': 'Other'
    },
        inputPlaceholder: 'Select a reason',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel Item',
        inputValidator: (value) => {
        if (!value) {
            return 'You need to select a reason!'
        }
    }
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
        input: 'select',
         inputOptions: {
        'Changed Mind': 'Changed Mind',
        'Ordered by Mistake': 'Ordered by Mistake',
        'Found Cheaper Elsewhere': 'Found Cheaper Elsewhere',
        'Shipping Too Slow': 'Shipping is too slow',
        'Other': 'Other'
    },
        inputPlaceholder: 'Select a reason',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel Order!',
            inputValidator: (value) => {
        if (!value) {
            return 'You need to select a reason!'
        }
    }
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