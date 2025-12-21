// 1. Handle Form Submit
document.getElementById('addressForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Manual Validation
    if (!validateAddressForm(e)) return;

    // Create Data Object
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Convert checkbox to boolean manually if needed, or handle in backend
    data.is_default_shipping = document.getElementById('defaultShipping').checked;

    try {
        const response = await fetch('/user/profile/addresses/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire('Saved!', 'Address added successfully', 'success')
                .then(() => location.reload()); // Reload to show new address
        } else {
            Swal.fire('Error', result.message || 'Failed to save', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Something went wrong', 'error');
    }
});

// Validation Function
function validateAddressForm(event) {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const pincode = document.getElementById('postal_code').value.trim();

    // 1. Name Check
    if (name.length < 3) {
        Swal.fire("Error", "Name must be at least 3 characters", "error");
        return false;
    }

    // 2. Phone Check (10 Digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        Swal.fire("Error", "Enter a valid 10-digit phone number", "error");
        return false;
    }

    // 3. Pincode Check (6 Digits)
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(pincode)) {
        Swal.fire("Error", "Enter a valid 6-digit Pincode", "error");
        return false;
    }

    return true; // Allow submit
}

// Modal Logic
function openAddModal() {
    document.getElementById('addressModal').style.display = 'block';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('addressModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
