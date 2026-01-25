// 1. Update Quantity
async function updateQty(itemId, action) {
    try {
        const response = await axios.patch('/cart/update', {
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
            const totalElement = document.getElementById('cart-total');
            const subtotalElement = document.getElementById('cart-subtotal');
            
            if (totalElement) totalElement.innerText = '₹' + response.data.cartTotal;
            if (subtotalElement) subtotalElement.innerText = '₹' + response.data.cartTotal;

            // C. Update the "Your Savings" section dynamically
            const savingsValue = response.data.totalSavings;
            const savingsRow = document.getElementById('savings-row');
            const savingsHr = document.getElementById('savings-hr');
            const savingsDisplay = document.getElementById('total-savings');

            if (savingsDisplay) {
                savingsDisplay.innerText = savingsValue;
            }

            // Toggle visibility of the savings row based on value
            if (savingsRow && savingsHr) {
                if (savingsValue > 0) {
                    savingsRow.style.display = 'flex';
                    savingsHr.style.display = 'block';
                } else {
                    savingsRow.style.display = 'none';
                    savingsHr.style.display = 'none';
                }
            }
        }
    } catch (error) {
        // Handle Errors (Out of Stock, Max Limit per person, etc.)
        const msg = error.response && error.response.data 
            ? error.response.data.message 
            : "Cannot update quantity";
            
        Swal.fire({
            icon: 'warning',
            title: 'Limit Reached',
            text: msg,
            position: 'center',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// 2. Remove Item from Cart
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

// 3. Checkout Navigation
function proceedToCheckout() {
    window.location.href = '/checkout';
}





























// async function updateQty(itemId, action) {
//     try {
//         const response = await axios.patch('/cart/update', {
//             itemId: itemId,
//             action: action
//         });

//            if (response.data.success) {
           
//             const qtyElement = document.getElementById(`qty-display-${itemId}`);
//             if (qtyElement) {
              
//                 qtyElement.innerText = response.data.newQty; 
//             }
         
//             const totalElement = document.getElementById('cart-total');
//             if (totalElement) {
              
//                 totalElement.innerText = '₹' + response.data.cartTotal;
//             }
            
   
//             const subtotalElement = document.getElementById('cart-subtotal');
//             if (subtotalElement) {
//                  subtotalElement.innerText = '₹' + response.data.cartTotal;
//             }
          
//         }
//     } catch (error) {
  
//         const msg = error.response && error.response.data 
//             ? error.response.data.message 
//             : "Cannot update quantity";
            
//         Swal.fire({
//             icon: 'warning',
//             title: 'Limit Reached',
//             text: msg,
           
//             position: 'center',
//             showConfirmButton: false,
//             timer: 3000
//         });
//     }
// }


// async function removeItem(itemId) {
//     const result = await Swal.fire({
//         title: 'Remove Item?',
//         text: "Are you sure you want to remove this item?",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, remove it!'
//     });

//     if (result.isConfirmed) {
//         try {
//             const response = await axios.delete(`/cart/remove/${itemId}`);
            
//             if (response.data.success) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Removed!',
//                     showConfirmButton: false,
//                     timer: 1000
//                 }).then(() => window.location.reload());
//             }
//         } catch (error) {
//             Swal.fire('Error', 'Failed to remove item', 'error');
//         }
//     }
// }


// function proceedToCheckout() {
//     window.location.href = '/checkout';
// }