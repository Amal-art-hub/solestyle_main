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
                
                const selectElement = document.querySelector(`select[data-order-id="${orderId}"]`);
                selectElement.className = `status-badge status-${newStatus.replace(/\s+/g, '-')}`;
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
            
                       let itemsHtml = order.items.map(item => {
                let actionButtons = '';
                
                // Logic to display the reason if it exists
                // let reasonHtml = '';
                // if(item.return_reason) {
                //     reasonHtml = `<div style="font-size: 0.85em; color: #666; margin-top: 4px;">
                //                     <strong>Return Reason:</strong> <em>"${item.return_reason}"</em>
                //                   </div>`;
                // }

                                // Logic to display the reason with "Read More" for long text
                                let reasonHtml = '';
                if(item.return_reason) {
                    const fullText = item.return_reason.replace(/"/g, '&quot;'); 
                    const shortText = fullText.length > 50 ? fullText.substring(0, 50) + '...' : fullText;
                    
                    /* FIXED LOGIC HERE: Using a dedicated function call instead of inline Swal */
                    const displayText = fullText.length > 50 
                        ? `<span title="${fullText}">${shortText} <a href="javascript:void(0)" onclick="showReason('${fullText.replace(/'/g, "\\'")}')" style="color: blue; font-size: 0.9em;">Read Full</a></span>`
                        : `"${fullText}"`;

                    reasonHtml = `<div style="font-size: 0.85em; color: #666; margin-top: 4px; max-width: 300px; word-wrap: break-word;">
                                    <strong>Return Reason:</strong> ${displayText}
                                  </div>`;
                }

                // Logic to show Approve/Reject buttons
                if (item.status === 'Return Request') {
                    actionButtons = `
                        <div style="margin-top: 5px;">
                            <span style="background: #ffc107; color: black; padding: 2px 6px; border-radius: 4px; font-size: 12px;">Return Request</span>
                            <button onclick="handleReturn('${order._id}', '${item._id}', 'approve')" 
                                style="background: #28a745; color: white; border: none; padding: 4px 8px; margin-left: 5px; border-radius: 4px; cursor: pointer;">Approve</button>
                            <button onclick="handleReturn('${order._id}', '${item._id}', 'reject')" 
                                style="background: #dc3545; color: white; border: none; padding: 4px 8px; margin-left: 5px; border-radius: 4px; cursor: pointer;">Reject</button>
                        </div>
                    `;
                }

                return `
                <li class="item" style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                   <img src="/uploads/variant-images/${item.variant_id?.images?.[2] || 'default.jpg'}" alt="Item" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <div>
                        <strong>${item.name_snapshot || item.product_id?.productName}</strong><br>
                        Qty: ${item.quantity} | Price: ₹${item.unit_price}
                        ${reasonHtml}
                        ${actionButtons}
                    </div>
                </li>
            `;
            }).join('');
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


async function handleReturn(orderId, itemId, action) {
    const url = action === 'approve' ?
        '/admin/orders/approve-return' :
        '/admin/orders/reject-return';

    try {
        const result = await Swal.fire({
            title: `Are you sure you want to ${action}?`,
            text: action === 'approve' ? "Funds will be refunded to the user's wallet." : "Return request will be rejected.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed!',
             confirmButtonColor: action === 'approve' ? '#28a745' : '#dc3545'
        });

        if (result.isConfirmed) {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, itemId })
            });

            const data = await response.json();

            if (data.success) {
                await Swal.fire('Success', data.message, 'success');
                viewOrderDetails(orderId); // Refresh modal to show updated status
            } else {
                throw new Error(data.message);
            }
        }
    } catch (error) {
        Swal.fire('Error', error.message || 'Something went wrong', 'error');
    }
}

/* Add this at the very bottom of orderList.js */
function showReason(text) {
    Swal.fire({
        title: 'Return Reason',
        text: text,
        icon: 'info',
        confirmButtonText: 'Close'
    });
}