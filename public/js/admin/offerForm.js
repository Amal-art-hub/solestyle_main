
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
  
    if (document.getElementById('offerType')) {
        toggleSelection();
    }


    const form = document.querySelector('form'); 

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

      
            const name = form.querySelector('input[name="name"]').value.trim();
            const discount = form.querySelector('input[name="discount_percentage"]').value;
            const type = form.querySelector('select[name="type"]').value;
            const startDate = form.querySelector('input[name="start_date"]').value;
            const endDate = form.querySelector('input[name="end_date"]').value;
            // ... (Insert your validation checks here) ...
            
            // --- DATA PREPARATION ---
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                if (key !== 'product_ids' && key !== 'category_ids') data[key] = value;
            });
            
            // Handle Multi-Selects
            const productSelect = form.querySelector('select[name="product_ids"]');
            const categorySelect = form.querySelector('select[name="category_ids"]');
            
            if (type === 'product' && productSelect) {
                data.product_ids = Array.from(productSelect.selectedOptions).map(opt => opt.value);
            } else if (type === 'category' && categorySelect) {
                data.category_ids = Array.from(categorySelect.selectedOptions).map(opt => opt.value);
            }

            // --- DYNAMIC SUBMISSION ---
            // This is the Magic: It uses the 'action' attribute from the HTML form!
            // Add Page: action="/admin/offers/add"
            // Edit Page: action="/admin/offers/edit/123"
            const url = form.getAttribute('action');  

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: result.message,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = '/admin/offers';
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: result.message });
                }
            } catch (error) {
                // ... Error handling ...
            }
        });
    }
});