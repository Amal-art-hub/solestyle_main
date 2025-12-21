---
description: Guide for Manual Implementation of Address Management
---

# Address Management Implementation Guide

This guide outlines the steps to build a manual address management system (CRUD) for your MERN stack application.

## 1. Verify Database Model
You already have a **`models/address.js`** file. Ensure it is imported in your services.

## 2. Create the View (UI)
Create a new file: **`views/user/addresses.ejs`**
- **List Addresses:** Loop through an array of addresses passed from the controller.
- **Add New Button:** A button to open a modal or navigate to an "Add Address" page.
- **Edit/Delete Buttons:** On each address card.

**Form Fields Required:**
- Name (`name`)
- Phone (`phone`)
- Street Address (`address_line1`, `address_line2`)
- City (`city`)
- State (`state`)
- Postal Code (`postal_code`)
- Checkbox: "Set as Default"

## 3. Create the Controller
Create **`controllers/user/addressController.js`**.

```javascript
const addressServices = require("../../services/userSer/addressServices");

// Validation Helper
const validateAddress = (data) => {
    const { name, phone, postal_code, city, state } = data;
    const errors = {};
    if (!name || name.trim().length < 3) errors.name = "Name is too short";
    if (!/^\d{10}$/.test(phone)) errors.phone = "Invalid Phone Number";
    if (!/^\d{6}$/.test(postal_code)) errors.pincode = "Invalid Pincode";
    if (!city || city.trim().length < 2) errors.city = "City is required";
    return { isValid: Object.keys(errors).length === 0, errors };
}

// 1. Load Page
const loadAddressPage = async (req, res) => {
    try {
        const addresses = await addressServices.getAddressByUserId(req.session.user._id);
        res.render("user/addresses", { addresses, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).render("page-500");
    }
}

// 2. Add Address
const addAddress = async (req, res) => {
    try {
        const validation = validateAddress(req.body);
        if (!validation.isValid) {
            return res.json({ success: false, message: "Validation Failed", errors: validation.errors });
        }
        await addressServices.createAddress(req.session.user._id, req.body);
        res.json({ success: true, message: "Address added successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
}

// 3. Edit Address
const editAddress = async (req, res) => {
    try {
        await addressServices.updateAddress(req.params.id, req.body);
        res.json({ success: true, message: "Address updated" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
}

// 4. Delete Address
const deleteAddress = async (req, res) => {
    try {
        await addressServices.deleteAddress(req.params.id);
        res.json({ success: true, message: "Address deleted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
}

module.exports = { loadAddressPage, addAddress, editAddress, deleteAddress };
```

## 4. Create the Service
Create **`services/userSer/addressServices.js`**.

```javascript
const Address = require("../../models/address");

// 1. Get All
const getAddressByUserId = async (userId) => {
    return await Address.find({ user_id: userId });
}

// 2. Add New
const createAddress = async (userId, data) => {
    const newAddress = new Address({
        user_id: userId,
        ...data // spread form fields
    });
    return await newAddress.save();
}

// 3. Update
const updateAddress = async (id, data) => {
    return await Address.findByIdAndUpdate(id, data, { new: true });
}

// 4. Delete
const deleteAddress = async (id) => {
    return await Address.findByIdAndDelete(id);
}

module.exports = { getAddressByUserId, createAddress, updateAddress, deleteAddress };
```

## 5. Define Routes
Update **`routes/userRouter.js`**:

```javascript
const addressController = require("../controllers/user/addressController");

// Page Load
router.get("/profile/addresses", auth.checkSession, addressController.loadAddressPage);

// Actions
router.post("/profile/addresses/add", auth.checkSession, addressController.addAddress);
router.put("/profile/addresses/edit/:id", auth.checkSession, addressController.editAddress); // Use Method Override or AJAX for PUT
router.delete("/profile/addresses/delete/:id", auth.checkSession, addressController.deleteAddress); // Use AJAX for DELETE
```

## 7. Frontend Implementations (Separate Files)

### A. Create the View: `views/user/addresses.ejs`
Link your new CSS and JS files here.

```html
<%- include('../partials/header') %>
<link rel="stylesheet" href="/css/user/address.css">

<div class="container">
    <h2>Address Management</h2>
    <div id="addressList">
        <!-- Loop addresses here -->
    </div>
    <button onclick="openAddModal()">Add New Address</button>
</div>

<!-- Add/Edit Modal Structure -->
<div id="addressModal" class="modal">
   <!-- Form with ID="addressForm" -->
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="/js/user/address.js"></script>
<%- include('../partials/footer') %>
```

### B. Create CSS: `public/css/user/address.css`
Style your cards and modals here.

```css
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
.address-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.modal-content { background: white; margin: 10% auto; padding: 20px; width: 50%; border-radius: 8px; }
```

### C. Create JS: `public/js/user/address.js` (AJAX + SweetAlert)
Handle form submission without reloading the page.

```javascript
// 1. Handle Form Submit
document.getElementById('addressForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Manual Validation (as done before)
    if (!validateAddressForm(e)) return;

    // Create Data Object
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

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
```
