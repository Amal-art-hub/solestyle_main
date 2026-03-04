// 1. Handle Form Submit
document.getElementById("addressForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Manual Validation
    if (!validateAddressForm(e)) return;

    // Create Data Object
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Check if we are in EDIT mode (does editAddressId have a value?)
    const addressId = document.getElementById("editAddressId").value;
    const isEditMode = addressId && addressId.trim() !== "";

    // Convert checkbox to boolean manually
    data.is_default_shipping = document.getElementById("defaultShipping").checked;

    // Determine URL and Method
    const url = isEditMode
        ? `/user/profile/addresses/edit/${addressId}`
        : "/user/profile/addresses/add";

    const method = isEditMode ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            if (isEditMode) {
                // ✅ UPDATE UI DYNAMICALLY (Edit Mode)
                const card = document.getElementById(`card-${addressId}`);
                if (card) {
                    card.querySelector(".addr-name").innerText = data.name;
                    card.querySelector(".addr-phone").innerText = data.phone;
                    card.querySelector(".addr-lines").innerText = data.address_line1 + (data.address_line2 ? `, ${data.address_line2}` : "");
                    card.querySelector(".addr-location").innerText = `${data.city}, ${data.state} - ${data.postal_code}`;

                    // Update data attributes on the edit button
                    const editBtn = card.querySelector(".edit-btn");
                    editBtn.setAttribute("data-name", data.name);
                    editBtn.setAttribute("data-phone", data.phone);
                    editBtn.setAttribute("data-line1", data.address_line1);
                    editBtn.setAttribute("data-line2", data.address_line2);
                    editBtn.setAttribute("data-city", data.city);
                    editBtn.setAttribute("data-state", data.state);
                    editBtn.setAttribute("data-postal", data.postal_code);
                    editBtn.setAttribute("data-default", data.is_default_shipping);

                    // Handle Default Badge
                    let badge = card.querySelector(".default-badge");
                    if (data.is_default_shipping) {
                        // REMOVE DEFAULT BADGE FROM ALL OTHER CARDS
                        document.querySelectorAll(".default-badge").forEach(b => b.remove());

                        if (!badge) {
                            const newBadge = document.createElement("span");
                            newBadge.className = "badge default-badge";
                            newBadge.style = "background:green; color:white; font-size: 10px; padding: 2px 5px; border-radius: 4px;";
                            newBadge.innerText = "Default";
                            card.querySelector("h3").appendChild(newBadge);
                        }
                    } else if (badge) {
                        badge.remove();
                    }
                }
                closeModal();
                Swal.fire("Saved!", "Address updated successfully.", "success");
            } else {
                // ✅ DYNAMIC ADD (No Reload)
                const addr = result.address;
                const addressList = document.getElementById("addressList");

                // Remove empty state message if it exists
                if (addressList.querySelector("p") && addressList.children.length === 1) {
                    addressList.innerHTML = "";
                }

                // If setting as default, remove other badges
                if (addr.is_default_shipping) {
                    document.querySelectorAll(".default-badge").forEach(b => b.remove());
                }

                const cardHTML = `
                    <div class="address-card" id="card-${addr._id}">
                        <h3>
                            <span class="addr-name">${addr.name}</span>
                            ${addr.is_default_shipping ? '<span class="badge default-badge" style="background:green; color:white; font-size: 10px; padding: 2px 5px; border-radius: 4px;">Default</span>' : ''}
                        </h3>
                        <p class="addr-lines">${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}</p>
                        <p class="addr-location">${addr.city}, ${addr.state} - ${addr.postal_code}</p>
                        <p>Phone: <span class="addr-phone">${addr.phone}</span></p>
                        <div class="actions">
                            <button onclick="openEditModal(this)" 
                                data-id="${addr._id}" data-name="${addr.name}"
                                data-phone="${addr.phone}" data-line1="${addr.address_line1}"
                                data-line2="${addr.address_line2 || ''}" data-city="${addr.city}"
                                data-state="${addr.state}" data-postal="${addr.postal_code}"
                                data-default="${addr.is_default_shipping}"
                                class="edit-btn" style="background-color: #007bff;">Edit</button>
                            <button onclick="deleteAddress('${addr._id}')" style="background-color: #dc3545;">Delete</button>
                        </div>
                    </div>
                `;
                addressList.insertAdjacentHTML("afterbegin", cardHTML);
                closeModal();
                Swal.fire("Saved!", "New address added successfully.", "success");
            }
        } else {
            Swal.fire("Error", result.message || "Failed to save", "error");
        }
    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Something went wrong", "error");
    }
});

// Validation Function
function validateAddressForm(event) {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const pincode = document.getElementById("postal_code").value.trim();
    const address1 = document.getElementById("address_line1").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();

    // 1. Name: Only letters and spaces, at least 3 chars
    if (!/^[a-zA-Z\s]{3,}$/.test(name)) {
        Swal.fire("Error", "Name must contain at least 3 letters (alphabets only)", "error");
        return false;
    }

    // 2. Phone Check (10 Digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        Swal.fire("Error", "Enter a valid 10-digit phone number", "error");
        return false;
    }

    // 3. Address Line 1: Not just symbols
    if (!/[a-zA-Z0-9]/.test(address1)) {
        Swal.fire("Error", "Address Line 1 cannot be empty or just symbols", "error");
        return false;
    }

    // 4. City Check
    if (!/^[a-zA-Z\s]{2,}$/.test(city)) {
        Swal.fire("Error", "Enter a valid City name (alphabets only)", "error");
        return false;
    }

    // 5. State Check
    if (!/^[a-zA-Z\s]{2,}$/.test(state)) {
        Swal.fire("Error", "Enter a valid State name (alphabets only)", "error");
        return false;
    }

    // 6. Pincode Check (6 Digits)
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
    document.getElementById("addressForm").reset();
    document.getElementById("editAddressId").value = ""; // Clear ID

    // 2. Update Title
    document.getElementById("modalTitle").innerText = "Add New Address";

    // 3. Show Modal
    document.getElementById("addressModal").style.display = "block";
}

// OPEN MODAL FOR EDITING
function openEditModal(button) {
    // 1. Get data from button attributes
    const id = button.getAttribute("data-id");
    const name = button.getAttribute("data-name");
    const phone = button.getAttribute("data-phone");
    const line1 = button.getAttribute("data-line1");
    const line2 = button.getAttribute("data-line2");
    const city = button.getAttribute("data-city");
    const state = button.getAttribute("data-state");
    const postal = button.getAttribute("data-postal");
    const isDefault = button.getAttribute("data-default") === "true";

    // 2. Populate Form
    document.getElementById("editAddressId").value = id;
    document.getElementById("name").value = name;
    document.getElementById("phone").value = phone;
    document.getElementById("address_line1").value = line1;
    document.getElementById("address_line2").value = line2;
    document.getElementById("city").value = city;
    document.getElementById("state").value = state;
    document.getElementById("postal_code").value = postal;
    document.getElementById("defaultShipping").checked = isDefault;

    // 3. Update Title
    document.getElementById("modalTitle").innerText = "Edit Address";

    // 4. Show Modal
    document.getElementById("addressModal").style.display = "block";
}


function closeModal() {
    document.getElementById("addressModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById("addressModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


// ------------------- DELETE LOGIC -------------------

async function deleteAddress(id) {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/user/profile/addresses/delete/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();

            if (data.success) {
                // ✅ REMOVE UI ELEMENT DYNAMICALLY
                const card = document.getElementById(`card-${id}`);
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => card.remove(), 300);
                }
                Swal.fire("Deleted!", "Your address has been deleted.", "success");
            } else {
                Swal.fire("Error", data.message, "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Server Error", "error");
        }
    }
}
