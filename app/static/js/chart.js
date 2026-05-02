document.addEventListener('DOMContentLoaded', async function () {
    const res = await fetch('/get-history');
    const data = await res.json();

    let fake = 0;
    let real = 0;

    let fakeConfidence = [];
    let realConfidence = [];

    const dateMap = {};

    data.forEach(item => {
        // 🔥 phân loại
        if (item.result === 'Tin Giả') {
            fake++;
            fakeConfidence.push(item.confidence);
        } else {
            real++;
            realConfidence.push(item.confidence);
        }

        // 🔥 group theo ngày
        const date = new Date(item.created_at).toLocaleDateString('vi-VN');
        dateMap[date] = (dateMap[date] || 0) + 1;
    });

    // ======================
    // PIE CHART
    // ======================
    new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels: ['Tin Giả', 'Tin Thật'],
            datasets: [{
                data: [fake, real],
                backgroundColor: ['#dc3545', '#198754']
            }]
        }
    });

    // ======================
    // BAR CHART (confidence)
    // ======================
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: ['Tin Giả', 'Tin Thật'],
            datasets: [{
                label: '%',
                data: [avg(fakeConfidence), avg(realConfidence)],
                backgroundColor: ['#dc3545', '#198754']
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    // ======================
    // LINE CHART (trend)
    // ======================
    const labels = Object.keys(dateMap);
    const values = Object.values(dateMap);

    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng',
                data: values,
                borderColor: '#0d6efd',
                fill: false
            }]
        }
    });
});