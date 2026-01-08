/* public/js/user/wishlist.js */

async function removeFromWishlist(id) {
    try {
        const result = await Swal.fire({
            title: 'Remove Item?',
            text: "Are you sure you want to remove this from your wishlist?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#333',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Remove it'
        });

        if (result.isConfirmed) {
            // Show loading state
            Swal.showLoading();

            const response = await axios.delete(`/user/wishlist/remove/${id}`);

            if (response.data.success) {
                // Success - Animation
                await Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'Item has been removed.',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Fade out the card and reload
                const card = document.getElementById(`wishlist-item-${id}`);
                if (card) {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => location.reload(), 500);
                } else {
                    location.reload();
                }
            } else {
                throw new Error(response.data.message);
            }
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response?.data?.message || 'Something went wrong!'
        });
    }
}