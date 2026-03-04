// Helper to refresh the brand table and content without a full reload
const refreshUI = async () => {
    try {
        console.log("[DEBUG] Fetching fresh brand table...");
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
                console.log("[UI Refresh] Brand content updated successfully.");
            }
        }
    } catch (error) {
        console.error("Refresh Error:", error);
    }
};

async function toggleStatus(id) {
    try {
        const response = await fetch(`/admin/blockBrand?id=${id}`, {
            method: "PATCH"
        });
        const data = await response.json();

        if (data.success) {
            await refreshUI();
        } else {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: data.message || "Failed to change status"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while blocking/unblocking the brand."
        });
    }
}

// Event Delegation for all form submissions
document.addEventListener("submit", async function (e) {
    const targetForm = e.target;

    // 1. ADD BRAND FORM
    if (targetForm && targetForm.id === "addBrandForm") {
        e.preventDefault();
        const formData = new FormData(targetForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch("/admin/addBrand", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Brand Added",
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
                    text: result.message || "Failed to add brand"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Request Failed",
                text: "Error adding brand. Please try again."
            });
        }
    }

    // 2. EDIT BRAND FORM
    if (targetForm && targetForm.id === "editBrandForm") {
        e.preventDefault();
        const id = document.getElementById("edit-id").value;
        const name = document.getElementById("edit-name").value;
        const description = document.getElementById("edit-description").value;

        try {
            const response = await fetch("/admin/editBrand", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name, description })
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Brand Updated",
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
                    text: result.message || "Failed to update brand"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error updating brand."
            });
        }
    }
});

function openEditModal(id, name, description) {
    const modal = document.getElementById("editBrandModal");
    if (!modal) return;
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-description").value = description || "";

    modal.style.display = "block";
}

function closeEditModal() {
    const modal = document.getElementById("editBrandModal");
    if (modal) modal.style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById("editBrandModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};