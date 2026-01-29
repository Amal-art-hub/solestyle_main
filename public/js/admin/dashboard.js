document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Chart with Default Data (from the EJS variables)
    const options = {
        chart: { type: 'area', height: 350, toolbar: { show: false } },
        series: [{ name: 'Sales', data: initialChartData.dataPoints }],
        xaxis: { categories: initialChartData.labels },
        colors: ['#4f46e5'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' }
    };
    const chart = new ApexCharts(document.querySelector("#salesChart"), options);
    chart.render();
    // 2. Handle Filter Clicks
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            // Update Toggle UI
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            
            try {
                // Fetch dynamic data from our new API
                const response = await fetch(`/admin/api/dashboard/chart?filter=${filter}`);
                        if (!response.ok) {
            // MANUALLY move the whole window to your 404 page
            window.location.href = "/page-404";
            return; 
        }
                const newData = await response.json();
                // Update the chart smoothly
                chart.updateOptions({
                    series: [{ data: newData.dataPoints }],
                    xaxis: { categories: newData.labels }
                });
            } catch (error) {         window.location.href = "/page-404"; }
        });
    });
});