async function toggleStatus(id) {
    try {
        const response = await fetch(`/admin/listCategory?id=${id}`, {
            method: 'GET'
        });
        const data = await response.json();
        
        if (data.success) {
            location.reload(); // Simple reload to show new status
        } else {
            alert("Failed to change status: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred");
    }
}
// Add Category Form Handler
document.getElementById('addCategoryForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/admin/addCategory', {
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
        alert("Error adding category");
    }
});
// Edit Modal Functions
function openEditModal(id, name, description) {
    const modal = document.getElementById('editCategoryModal');
    // Populate form
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-description').value = description;
    
    modal.style.display = "block";
}
function closeEditModal() {
    document.getElementById('editCategoryModal').style.display = "none";
}
// Close modal if clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editCategoryModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// Edit Form Submission
document.getElementById('editCategoryForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const description = document.getElementById('edit-description').value;
    try {
        const response = await fetch('/admin/editCategory', {
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
        alert("Error updating category");
    }
});