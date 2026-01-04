const modal = document.getElementById("couponModal");
const form = document.getElementById("couponForm");
const modalTitle = document.getElementById("modalTitle");

function clearErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.remove());
    document.querySelectorAll('.form-control').forEach(el => el.style.borderColor = '#dee2e6');
}

function showError(inputName, message) {
    const input = document.querySelector(`[name="${inputName}"]`);
    if (input) {
        input.style.borderColor = '#dc3545';
        const error = document.createElement('small');
        error.className = 'error-text';
        error.style.color = '#dc3545';
        error.style.fontSize = '12px';
        error.style.marginTop = '5px';
        error.innerText = message;
        input.parentNode.appendChild(error);
    }
}
function openModal(mode, id = '', code = '', desc = '', type = 'Percentage', value = '', min = '', date = '') {
    clearErrors();
    modal.style.display = "block";

    if (mode === 'add') {
        modalTitle.innerText = "Add New Coupon";
        form.reset();
        document.getElementById('couponId').value = "";
    } else {
        modalTitle.innerText = "Edit Coupon";
        document.getElementById('couponId').value = id;
        document.getElementById('code').value = code;
        document.getElementById('description').value = desc;
        document.getElementById('discount_type').value = type;
        document.getElementById('discount_value').value = value;
        document.getElementById('mincart_value').value = min;
        document.getElementById('expiry_date').value = date;
    }
}
function closeModal() {
    modal.style.display = "none";
}
window.onclick = function (event) { if (event.target == modal) closeModal(); }


form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors(); 

    const code = document.getElementById('code').value.trim();
    const desc = document.getElementById('description').value.trim();
    const type = document.getElementById('discount_type').value;
    const value = parseFloat(document.getElementById('discount_value').value);
    const minCart = parseFloat(document.getElementById('mincart_value').value);
    const expiry = document.getElementById('expiry_date').value;

    let isValid = true;


    if (!code) {
        showError('code', 'Coupon code is required');
        isValid = false;
    } else if (code.length < 3) {
        showError('code', 'Code must be at least 3 chars');
        isValid = false;
    } else if (/\s/.test(code)) {
        showError('code', 'No spaces allowed in code');
        isValid = false;
    }

    
    if (!value || value <= 0) {
        showError('discount_value', 'Positive value required');
        isValid = false;
    } else if (type === 'Percentage' && value > 99) {
        showError('discount_value', 'Percentage cannot exceed 99%');
        isValid = false;
    }

    // MIN CART VALIDATION
    if (minCart < 0) {
        showError('mincart_value', 'Cannot be negative');
        isValid = false;
    }

    
    if (!expiry) {
        showError('expiry_date', 'Date is required');
        isValid = false;
    } else {
        const selectedDate = new Date(expiry);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            showError('expiry_date', 'Date cannot be in the past');
            isValid = false;
        }
    }

    if (!isValid) return; 


    const id = document.getElementById('couponId').value;
    const mode = id ? 'edit' : 'add';
    const url = mode === 'add' ? '/admin/coupons/add' : `/admin/coupons/edit/${id}`;

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await axios.post(url, data);
        if (response.data.success) {
            closeModal();
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => window.location.reload());
        }
    } catch (error) {
     
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Something went wrong'
        });
    }
});

/* --- Delete Logic --- */
function deleteCoupon(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`/admin/coupons/${id}`)
                .then(response => {
                    if (response.data.success) {
                        Swal.fire('Deleted!', 'Success', 'success')
                            .then(() => window.location.reload());
                    }
                })
                .catch(err => Swal.fire('Error', 'Failed to delete', 'error'));
        }
    })
}
