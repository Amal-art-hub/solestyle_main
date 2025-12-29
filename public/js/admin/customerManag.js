function confirmAction(url, action) {
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to ${action} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: action === 'block' ? '#d33' : '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: `Yes, ${action} user!`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // CHANGE: Use fetch with PATCH method
                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();

                if (data.success) {
                    Swal.fire(
                        'Success!',
                        data.message,
                        'success'
                    ).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire(
                        'Error!',
                        data.message || 'Action failed',
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire(
                    'Error!',
                    'Something went wrong',
                    'error'
                );
            }
        }
    })
}