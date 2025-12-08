function confirmAction(url, action) {
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to ${action} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: action === 'block' ? '#d33' : '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: `Yes, ${action} user!`
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = url;
        }
    })
}