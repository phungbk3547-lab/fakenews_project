document.addEventListener('DOMContentLoaded', async function () {
    const tableBody = document.getElementById('historyTableBody');

    // 🔥 MAP GIẢI THÍCH TỪ KHÓA
    const dangerExplain = {
        "link": "Có thể chứa liên kết lừa đảo",
        "http": "Đường link không an toàn",
        "trúng thưởng": "Chiêu trò scam phổ biến",
        "miễn phí": "Dễ gây dụ người dùng",
        "khẩn cấp": "Tạo tâm lý hoảng loạn",
        "xác thực": "Giả mạo yêu cầu xác thực",
        "tài khoản": "Liên quan thông tin nhạy cảm",
        "50 triệu": "Mồi nhử tài chính",
        "chia sẻ": "Dấu hiệu lan truyền tin giả"
    };

    // 🔥 HÀM HIGHLIGHT + TOOLTIP
    function highlightText(text, keywords) {
        if (!keywords || keywords.length === 0) return text;

        let result = text;

        keywords.forEach(word => {
            const reason = dangerExplain[word] || "Từ khóa đáng ngờ";

            // tránh lỗi ký tự đặc biệt
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const regex = new RegExp(`(${escapedWord})`, 'gi');

            result = result.replace(
                regex,
                `<span class="highlight" title="${reason}">$1</span>`
            );
        });

        return result;
    }

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

            // 🔥 FORMAT GIỜ VN
            const time = new Date(item.created_at).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // 🔥 HIGHLIGHT NỘI DUNG + TOOLTIP
            const highlightedContent = highlightText(item.content, item.danger_words);

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="content-cell">${highlightedContent}</td>
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