// 1. Handle Form Submit
document.getElementById('addressForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Manual Validation
    if (!validateAddressForm(e)) return;

    // Create Data Object
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Check if we are in EDIT mode (does editAddressId have a value?)
    const addressId = document.getElementById('editAddressId').value;
    const isEditMode = addressId && addressId.trim() !== "";

    // Convert checkbox to boolean manually
    data.is_default_shipping = document.getElementById('defaultShipping').checked;

    // Determine URL and Method
    const url = isEditMode
        ? `/user/profile/addresses/edit/${addressId}`
        : '/user/profile/addresses/add';

    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire('Saved!', result.message, 'success')
                .then(() => location.reload()); // Reload to show new/updated address
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

// ------------------- MODAL LOGIC -------------------

// OPEN MODAL FOR ADDING
function openAddModal() {
    // 1. Reset Form
    document.getElementById('addressForm').reset();
    document.getElementById('editAddressId').value = ""; // Clear ID

    // 2. Update Title
    document.getElementById('modalTitle').innerText = "Add New Address";

    // 3. Show Modal
    document.getElementById('addressModal').style.display = 'block';
}

// OPEN MODAL FOR EDITING
function openEditModal(button) {
    // 1. Get data from button attributes
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const phone = button.getAttribute('data-phone');
    const line1 = button.getAttribute('data-line1');
    const line2 = button.getAttribute('data-line2');
    const city = button.getAttribute('data-city');
    const state = button.getAttribute('data-state');
    const postal = button.getAttribute('data-postal');
    const isDefault = button.getAttribute('data-default') === 'true';

    // 2. Populate Form
    document.getElementById('editAddressId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('phone').value = phone;
    document.getElementById('address_line1').value = line1;
    document.getElementById('address_line2').value = line2;
    document.getElementById('city').value = city;
    document.getElementById('state').value = state;
    document.getElementById('postal_code').value = postal;
    document.getElementById('defaultShipping').checked = isDefault;

    // 3. Update Title
    document.getElementById('modalTitle').innerText = "Edit Address";

    // 4. Show Modal
    document.getElementById('addressModal').style.display = 'block';
}


function closeModal() {
    document.getElementById('addressModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('addressModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// ------------------- DELETE LOGIC -------------------

async function deleteAddress(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/user/profile/addresses/delete/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire('Deleted!', 'Your address has been deleted.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Server Error', 'error');
        }
    }
}
