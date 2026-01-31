// d:\MERN\PROJECTS\Shoe-project\public\js\admin\offerForm.js

function toggleSelection() {
    const type = document.getElementById('offerType').value;
    const productSelect = document.getElementById('productSelect');
    const categorySelect = document.getElementById('categorySelect');
    if (productSelect) productSelect.style.display = 'none';
    if (categorySelect) categorySelect.style.display = 'none';
    if (type === 'product' && productSelect) productSelect.style.display = 'block';
    if (type === 'category' && categorySelect) categorySelect.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('offerType')) toggleSelection();

    const form = document.querySelector('form'); 
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // --- 1. MANUAL VALIDATIONS (The New Part) ---
            const name = form.querySelector('input[name="name"]').value.trim();
            const discount = parseInt(form.querySelector('input[name="discount_percentage"]').value);
            const type = document.getElementById('offerType').value;
            const startDate = form.querySelector('input[name="start_date"]').value;
            const endDate = form.querySelector('input[name="end_date"]').value;

            if (!name) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Offer Name is required' });
                return;
            }

            if (isNaN(discount) || discount < 1 || discount > 99) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Discount must be between 1% and 99%' });
                return;
            }

            if (!startDate || !endDate) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Both Start and End dates are required' });
                return;
            }

            if (new Date(endDate) < new Date(startDate)) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'End Date cannot be before Start Date' });
                return;
            }

            // Check if items are selected based on type
            if (type === 'product') {
                const productSelect = form.querySelector('select[name="product_ids"]');
                if (!productSelect.selectedOptions.length) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Please select at least one Product' });
                    return;
                }
            } else if (type === 'category') {
                const categorySelect = form.querySelector('select[name="category_ids"]');
                if (!categorySelect.selectedOptions.length) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Please select at least one Category' });
                    return;
                }
            }

            // --- 2. DATA PREPARATION ---
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                if (key !== 'product_ids' && key !== 'category_ids') data[key] = value;
            });
            
            if (type === 'product') {
                data.product_ids = Array.from(form.querySelector('select[name="product_ids"]').selectedOptions).map(opt => opt.value);
            } else if (type === 'category') {
                data.category_ids = Array.from(form.querySelector('select[name="category_ids"]').selectedOptions).map(opt => opt.value);
            }

            const url = form.getAttribute('action');  

            // --- 3. SUBMIT LOGIC ---
            async function submitOffer(isOverride = false) {
                if (isOverride) data.override = true;

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    // Handle conflicts (Overlapping offers)
                    if (response.status === 409 && result.conflict) {
                        const confirm = await Swal.fire({
                            title: 'Offer Overlap!',
                            text: `${result.message}. Should I move these items to the new offer?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, replace',
                            cancelButtonText: 'No, cancel'
                        });
                        if (confirm.isConfirmed) return submitOffer(true);
                        return;
                    }

                    if (result.success) {
                        Swal.fire({ icon: 'success', title: 'Success', text: result.message, showConfirmButton: false, timer: 1500 })
                        .then(() => { window.location.href = '/admin/offers'; });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: result.message });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong!' });
                }
            }
            submitOffer();
        });
    }
});