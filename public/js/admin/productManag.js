document.addEventListener("DOMContentLoaded", function () {
  // Get all List/Unlist buttons
  const toggleButtons = document.querySelectorAll(".btn-list, .btn-unlist");

  toggleButtons.forEach(button => {
    button.addEventListener("click", async function () {
      const productId = this.getAttribute("data-id");
      const isListed = this.getAttribute("data-listed") === "true";

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

        const result = await response.json();

        if (result.success) {
          await Swal.fire({
            title: "Success!",
            text: result.message,
            icon: "success",
            confirmButtonText: "OK"
          });
          location.reload();
        } else {
          Swal.fire("Error", result.message || "Failed", "error");
        }
      } catch (error) {
        console.error("Error toggling product listing:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred. Please try again."
        });
      }
    });
  });
});