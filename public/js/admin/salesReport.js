
document.addEventListener('DOMContentLoaded', function() {
   
    const periodSelect = document.getElementById('periodSelect');
    const customDateInputs = document.getElementById('customDateInputs');
    
    periodSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateInputs.classList.remove('hidden');
            customDateInputs.style.display = 'flex';
        } else {
            customDateInputs.classList.add('hidden');
            customDateInputs.style.display = 'none';
        }
    });

   
    const filterForm = document.getElementById('filterForm');
    filterForm.addEventListener('submit', function(e) {
        if (periodSelect.value === 'custom') {
            const startDate = document.querySelector('input[name="startDate"]').value;
            const endDate = document.querySelector('input[name="endDate"]').value;
            
            if (!startDate || !endDate) {
                e.preventDefault();
                Swal.fire('Error', 'Please select both Start and End dates for custom filter', 'warning');
            }
        }
    });
});


function downloadReport(type) {

    const urlParams = new URLSearchParams(window.location.search);
    const period = urlParams.get('period') || 'daily';
    const startDate = urlParams.get('startDate') || '';
    const endDate = urlParams.get('endDate') || '';


    let downloadUrl = `/admin/sales-report/download/${type}?period=${period}`;
    if (period === 'custom') {
        downloadUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    
    window.location.href = downloadUrl;
}