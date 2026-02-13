
document.addEventListener("DOMContentLoaded", function () {








    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    // 2. Disable future dates
    const today = new Date().toISOString().split("T")[0];
    if (startDateInput) startDateInput.setAttribute("max", today);
    if (endDateInput) endDateInput.setAttribute("max", today);
    // 3. (Optional) Validation: Start date can't be after end date
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener("change", function () {
            endDateInput.setAttribute("min", this.value);

             if (endDateInput.value && endDateInput.value < this.value) {
                endDateInput.value = "";
            }

        });

           endDateInput.addEventListener("change", function () {
            startDateInput.setAttribute("max", this.value || today);
        });
       
        
    }








    const periodSelect = document.getElementById("periodSelect");
    const customDateInputs = document.getElementById("customDateInputs");
    const applyFilterBtn = document.getElementById("applyFilterBtn");

    periodSelect.addEventListener("change", function () {
        if (this.value === "custom") {
            customDateInputs.classList.remove("hidden");
            applyFilterBtn.classList.remove("hidden");
            // customDateInputs.style.display = 'flex';
        } else {
            customDateInputs.classList.add("hidden");
            applyFilterBtn.classList.add("hidden");
            // customDateInputs.style.display = 'none';
            this.closest("form").submit();
        }
    });


    const filterForm = document.getElementById("filterForm");
    filterForm.addEventListener("submit", function (e) {
        if (periodSelect.value === "custom") {
            const startDate = document.querySelector("input[name=\"startDate\"]").value;
            const endDate = document.querySelector("input[name=\"endDate\"]").value;

            if (!startDate || !endDate) {
                e.preventDefault();
                Swal.fire("Error", "Please select both Start and End dates for custom filter", "warning");
            }
        }
    });
});


function downloadReport(type) {

    const urlParams = new URLSearchParams(window.location.search);
    const period = urlParams.get("period") || "daily";
    const startDate = urlParams.get("startDate") || "";
    const endDate = urlParams.get("endDate") || "";


    let downloadUrl = `/admin/sales-report/download/${type}?period=${period}`;
    if (period === "custom") {
        downloadUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }


    window.location.href = downloadUrl;
}