async function toggleStatus(id) {
    try {
        
        const response = await fetch(`/admin/blockBrand?id=${id}`, {
            method: 'PATCH'
        });

        const data = await response.json(); 
        
        if (data.success) { 
            location.reload();
        } else {
            alert("Failed to change status: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred");
    }
}

document.getElementById('addBrandForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/admin/addBrand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Error adding brand");
    }
});
// Edit Modal Functions (If we implemented Edit Brand)
// Current router doesn't have editBrand, so ignoring or disabling.
// Edit Modal Functions
function openEditModal(id, name, description) {
    const modal = document.getElementById('editBrandModal');
    // Populate form
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-description').value = description || ""; // Handle null/undefined

    modal.style.display = "block";
}

function closeEditModal() {
    document.getElementById('editBrandModal').style.display = "none";
}

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('editBrandModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Edit Form Submission
document.getElementById('editBrandForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const description = document.getElementById('edit-description').value;

    try {
        const response = await fetch('/admin/editBrand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, description })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Error updating brand");
    }
});