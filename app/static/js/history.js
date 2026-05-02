document.addEventListener('DOMContentLoaded', async function () {
    const tableBody = document.getElementById('historyTableBody');

    try {
        const response = await fetch('/get-history');
        const data = await response.json();

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có dữ liệu.</td></tr>';
            return;
        }

        let html = '';

        data.forEach((item, index) => {
            const badgeClass = item.result === 'Tin Giả' ? 'bg-danger' : 'bg-success';

            const confidence = Number(item.confidence).toFixed(2) + '%';

            // 🔥 FIX CHUẨN GIỜ VN (KHÔNG BỊ LỆCH)
            const time = new Date(item.created_at).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.content}</td>
                    <td><span class="badge ${badgeClass}">${item.result}</span></td>
                    <td>${confidence}</td>
                    <td>${time}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Lỗi tải dữ liệu</td></tr>';
        console.error(error);
    }
});