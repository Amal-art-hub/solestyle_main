// Helper to refresh the product table and content without a full reload
const refreshUI = async () => {
  try {
    console.log("[DEBUG] Fetching fresh product table...");
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
        console.log("[UI Refresh] Product content updated successfully.");
      }
    }
  } catch (error) {
    console.error("Refresh Error:", error);
  }
};

// Use Event Delegation for Toggle Buttons to handle dynamic HTML updates
document.addEventListener("click", async function (e) {
  const target = e.target;

  // Check if clicked element is a List/Unlist button
  if (target && (target.classList.contains("btn-list") || target.classList.contains("btn-unlist"))) {
    const productId = target.getAttribute("data-id");
    const isListed = target.getAttribute("data-listed") === "true";

    // Confirm action with user
    const action = isListed ? "unlist" : "list";
    const confirmMessage = `Are you sure you want to ${action} this product?`;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, do it!"
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/admin/products/toggle-listing?id=${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: "Success!",
          text: data.message,
          icon: "success",
          confirmButtonText: "OK",
          timer: 1500
        });
        await refreshUI();
      } else {
        Swal.fire("Error", data.message || "Failed", "error");
      }
    } catch (error) {
      console.error("Error toggling product listing:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred. Please try again."
      });
    }
  }
});