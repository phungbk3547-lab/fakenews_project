document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/get-history');
        const data = await response.json();

        let countFake = 0;
        let countReal = 0;
        let totalConfFake = 0;
        let totalConfReal = 0;

        data.forEach(item => {
            if(item.result === 'Tin Giả') {
                countFake++;
                totalConfFake += item.confidence;
            } else {
                countReal++;
                totalConfReal += item.confidence;
            }
        });

        // PIE
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Tin Thật', 'Tin Giả'],
                datasets: [{
                    data: [countReal, countFake],
                    backgroundColor: ['#198754', '#dc3545']
                }]
            }
        });

        // ✅ FIX: KHÔNG nhân 100 nữa
        const avgConfReal = countReal > 0 ? (totalConfReal / countReal) : 0;
        const avgConfFake = countFake > 0 ? (totalConfFake / countFake) : 0;

        const barCtx = document.getElementById('barChart').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Tin Thật', 'Tin Giả'],
                datasets: [{
                    label: 'Độ tin cậy (%)',
                    data: [avgConfReal.toFixed(2), avgConfFake.toFixed(2)],
                    backgroundColor: ['#198754', '#dc3545']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

    } catch (error) {
        console.error("Lỗi chart:", error);
    }
});