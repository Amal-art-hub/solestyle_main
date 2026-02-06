async function toggleStatus(id) {
    try {

        const response = await fetch(`/admin/listCategory?id=${id}`, {
            method: 'PATCH'
        });
        const data = await response.json();

        if (data.success) {
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Operation Failed',
                text: data.message || "Failed to change status"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "An unexpected error occurred while toggling status."
        });
    }
}



document.getElementById('addCategoryForm')?.addEventListener('submit', async function (e) {
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
            await Swal.fire({
                icon: 'success',
                title: 'Category Added',
                text: result.message,
                timer: 1500,
                showConfirmButton: false
            });
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || "Failed to add category"
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Request Error',
            text: "Error adding category. Please check your connection."
        });
    }
});

function openEditModal(id, name, description) {
    const modal = document.getElementById('editCategoryModal');

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-description').value = description;

    modal.style.display = "block";
}
function closeEditModal() {
    document.getElementById('editCategoryModal').style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById('editCategoryModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('editCategoryForm')?.addEventListener('submit', async function (e) {
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
            await Swal.fire({
                icon: 'success',
                title: 'Category Updated',
                text: result.message,
                timer: 1500,
                showConfirmButton: false
            });
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: result.message || "Failed to update category"
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Submission Error',
            text: "Error updating category. Please try again."
        });
    }
});