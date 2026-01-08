document.addEventListener('DOMContentLoaded', function() {
  // Get all List/Unlist buttons
  const toggleButtons = document.querySelectorAll('.btn-list, .btn-unlist');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const productId = this.getAttribute('data-id');
      const isListed = this.getAttribute('data-listed') === 'true';
      
      // Confirm action with user
      const action = isListed ? 'unlist' : 'list';
      const confirmMessage = `Are you sure you want to ${action} this product?`;
      
      // if (!confirm(confirmMessage)) {
      //   return;
      // }

      /* REPLACE LINES 14-16 WITH THIS: */
const result = await Swal.fire({
    title: 'Are you sure?',
    text: confirmMessage,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, do it!'
});

if (!result.isConfirmed) {
    return;
}
      
      try {
        const response = await fetch(`/admin/products/toggle-listing?id=${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        // if (result.success) {
        //   // Show success message
        //   alert(result.message);
          
        //   // Reload the page to reflect changes
        //   location.reload();
        // } else {
        //   alert(result.message || 'Failed to toggle product listing');
        // }

        /* REPLACE LINES 43-51 WITH THIS: */
if (result.success) {
    // Show Success Popup AND Wait for user to click OK
    await Swal.fire({
        title: 'Success!',
        text: result.message,
        icon: 'success',
        confirmButtonText: 'OK'
    });
    
    // RELOAD ONLY AFTER THEY CLICK OK
    location.reload();
} else {
    Swal.fire('Error', result.message || 'Failed', 'error');
}
      } catch (error) {
        console.error('Error toggling product listing:', error);
        alert('An error occurred. Please try again.');
      }
    });
  });
});