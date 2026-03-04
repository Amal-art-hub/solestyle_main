function confirmAction(url, action, buttonElement) {
    Swal.fire({
        title: "Are you sure?",
        text: `Do you really want to ${action} this user?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: action === "block" ? "#d33" : "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: `Yes, ${action} user!`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(url, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" }
                });
                
                const data = await response.json();

                if (data.success) {
                    Swal.fire("Success!", data.message, "success");
                    
                    const row = buttonElement.closest('tr');
                    const badge = row.querySelector('.status-badge');

                    if (action === "block") {
                        badge.innerText = "Blocked";
                        badge.className = "status-badge status-blocked";
                        buttonElement.innerText = "Unblock";
                        buttonElement.className = "action-btn btn-unblock";
                        buttonElement.setAttribute("onclick", `confirmAction('${url.replace('block', 'unblock')}', 'unblock', this)`);
                    } else {
                        badge.innerText = "Active";
                        badge.className = "status-badge status-active";
                        buttonElement.innerText = "Block";
                        buttonElement.className = "action-btn btn-block";
                        buttonElement.setAttribute("onclick", `confirmAction('${url.replace('unblock', 'block')}', 'block', this)`);
                    }
                } else {
                    Swal.fire("Error!", data.message || "Action failed", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire("Error!", "Something went wrong", "error");
            }
        }
    });
}
