// Helper to refresh the category table and content without a full reload
const refreshUI = async () => {
    try {
        console.log("[DEBUG] Fetching fresh category table...");
        const response = await fetch(window.location.href, {
            method: "GET",
            headers: { "Accept": "text/html" }
        });
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, "text/html");
            const newContent = newDoc.querySelector(".main-content");
            const currentContent = document.querySelector(".main-content");

            if (newContent && currentContent) {
                currentContent.innerHTML = newContent.innerHTML;
                console.log("[UI Refresh] Category content updated successfully.");
            }
        }
    } catch (error) {
        console.error("Refresh Error:", error);
    }
};

async function toggleStatus(id) {
    try {
        const response = await fetch(`/admin/listCategory?id=${id}`, {
            method: "PATCH"
        });
        const data = await response.json();

        if (data.success) {
            await refreshUI();
        } else {
            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: data.message || "Failed to change status"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "An unexpected error occurred while toggling status."
        });
    }
}

// Event Delegation for all form submissions to handle dynamic HTML updates
document.addEventListener("submit", async function (e) {
    const targetForm = e.target;

    // 1. ADD CATEGORY FORM
    if (targetForm && targetForm.id === "addCategoryForm") {
        e.preventDefault();
        const formData = new FormData(targetForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch("/admin/addCategory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Category Added",
                    text: result.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                await refreshUI();
                targetForm.reset();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result.message || "Failed to add category"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Request Error",
                text: "Error adding category."
            });
        }
    }

    // 2. EDIT CATEGORY FORM
    if (targetForm && targetForm.id === "editCategoryForm") {
        e.preventDefault();
        const id = document.getElementById("edit-id").value;
        const name = document.getElementById("edit-name").value;
        const description = document.getElementById("edit-description").value;
        try {
            const response = await fetch("/admin/editCategory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name, description })
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Category Updated",
                    text: result.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                await refreshUI();
                closeEditModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: result.message || "Failed to update category"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Submission Error",
                text: "Error updating category."
            });
        }
    }
});

function openEditModal(id, name, description) {
    const modal = document.getElementById("editCategoryModal");
    if (!modal) return;
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-description").value = description;
    modal.style.display = "block";
}

function closeEditModal() {
    const modal = document.getElementById("editCategoryModal");
    if (modal) modal.style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById("editCategoryModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};