function deleteOffer(offerId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`/admin/offers/${offerId}`)
                .then(response => {
                    if (response.data.success) {
                        Swal.fire('Deleted!', 'Success', 'success')
                        .then(() => window.location.reload());
                    } else {
                        Swal.fire('Error!', 'Failed', 'error');
                    }
                })
                .catch(err => Swal.fire('Error!', 'Server Error', 'error'));
        }
    })
}