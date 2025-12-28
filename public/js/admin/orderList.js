// Status Update Function
async function updateStatus(orderId, newStatus) {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to change order status to "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!'
        });

        if (result.isConfirmed) {
            const response = await fetch('/admin/orders/update-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                await Swal.fire('Updated!', 'Order status has been updated.', 'success');
                // Update class for color change
                const selectElement = document.querySelector(`select[data-order-id="${orderId}"]`);
                selectElement.className = `status-badge ${newStatus.replace(/\s+/g, '-')}`;
            } else {
                throw new Error(data.message);
            }
        } else {
            location.reload(); 
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error!', 'Failed to update status: ' + error.message, 'error');
    }
}


const modal = document.getElementById("orderModal");
const span = document.getElementsByClassName("close-modal")[0];

span.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

async function viewOrderDetails(orderId) {
    const modalBody = document.getElementById("modalBody");
    modal.style.display = "block";
    modalBody.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
        const response = await fetch(`/admin/orders/details/${orderId}`);
        const data = await response.json();

        if (data.success) {
            const order = data.order;
            
            let itemsHtml = order.items.map(item => `
                <li class="item">
                   <img src="/uploads/variant-images/${item.variant_id?.images?.[2] || 'default.jpg'}" ... >
                    <div>
                        <strong>${item.name_snapshot || item.product_id?.productName}</strong><br>
                        Qty: ${item.quantity} | Price: ₹${item.unit_price}
                    </div>
                </li>
            `).join('');

            const content = `
                <div class="detail-group">
                    <div class="detail-title">Order Info</div>
                    <p><strong>Order ID:</strong> #${order.order_number}</p>
                    <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Payment:</strong> ${order.payment_id ? 'Online/Wallet' : 'COD'}</p> 
                </div>
                <div class="detail-group">
                    <div class="detail-title">Shipping Address</div>
                    <p>
                        ${order.shipping_address_snapshot.name}<br>
                        ${order.shipping_address_snapshot.address_line1}, ${order.shipping_address_snapshot.city}<br>
                        Phone: ${order.shipping_address_snapshot.phone}
                    </p>
                </div>
                <div class="detail-group">
                    <div class="detail-title">Items</div>
                    <ul class="item-list">${itemsHtml}</ul>
                </div>
                <div class="detail-group">
                    <div class="detail-title">Summary</div>
                    <p><strong>Total:</strong> ₹${order.final_total}</p>
                </div>
            `;
            
            modalBody.innerHTML = content;
        } else {
            modalBody.innerHTML = '<p class="error">Failed to load details</p>';
        }
    } catch (error) {
        modalBody.innerHTML = '<p class="error">Error loading details</p>';
    }
}