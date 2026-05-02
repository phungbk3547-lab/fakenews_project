document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('newsInput');
    const preview = document.getElementById('highlightedText');

    // 🔥 từ khóa giống backend
    const dangerWords = [
        "trúng thưởng", "miễn phí", "khẩn cấp", "xác thực",
        "link", "http", "tài khoản", "50 triệu", "chia sẻ"
    ];

    // 🔥 giải thích tooltip
    const dangerExplain = {
        "link": "Có thể dẫn đến trang lừa đảo",
        "http": "Đường link không an toàn",
        "trúng thưởng": "Chiêu trò scam phổ biến",
        "miễn phí": "Dễ dụ người dùng",
        "khẩn cấp": "Tạo cảm giác hoảng loạn",
        "xác thực": "Giả mạo yêu cầu bảo mật",
        "tài khoản": "Thông tin nhạy cảm",
        "50 triệu": "Mồi nhử tài chính",
        "chia sẻ": "Lan truyền tin giả"
    };

    // 🔥 highlight realtime
    function highlightRealtime(text) {
        let result = text;

        dangerWords.forEach(word => {
            const reason = dangerExplain[word] || "Từ khóa đáng ngờ";

            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escaped})`, 'gi');

            result = result.replace(
                regex,
                `<span class="highlight" data-tooltip="${reason}">$1</span>`
            );
        });

        return result;
    }

    // 🔥 realtime khi gõ
    input.addEventListener('input', () => {
        const text = input.value;
        preview.innerHTML = highlightRealtime(text);
    });
});


// 🔥 CALL BACKEND
async function checkNews() {
    const text = document.getElementById("newsInput").value;

    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("btnSpinner");

    btnText.innerText = "Đang xử lý...";
    spinner.classList.remove("d-none");

    const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    const data = await res.json();

    btnText.innerText = "Dự đoán ngay";
    spinner.classList.add("d-none");

    // 🔥 HIỂN THỊ RESULT
    document.getElementById("resultCard").classList.remove("d-none");

    const badge = document.getElementById("predictionBadge");
    badge.innerText = data.result + " (" + data.confidence + "%)";
    badge.className = "badge " + (data.result === "Tin Giả" ? "bg-danger" : "bg-success");

    // 🔥 highlight theo backend (chuẩn hơn realtime)
    const highlighted = highlightBackend(text, data.danger_words);
    document.getElementById("highlightedText").innerHTML = highlighted;
}


// 🔥 highlight theo backend (chuẩn AI)
function highlightBackend(text, keywords) {
    const dangerExplain = {
        "link": "Có thể dẫn đến trang lừa đảo",
        "http": "Đường link không an toàn",
        "trúng thưởng": "Chiêu trò scam phổ biến",
        "miễn phí": "Dễ dụ người dùng",
        "khẩn cấp": "Tạo cảm giác hoảng loạn",
        "xác thực": "Giả mạo yêu cầu bảo mật",
        "tài khoản": "Thông tin nhạy cảm",
        "50 triệu": "Mồi nhử tài chính",
        "chia sẻ": "Lan truyền tin giả"
    };

    let result = text;

    keywords.forEach(word => {
        const reason = dangerExplain[word] || "Từ khóa đáng ngờ";

        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');

        result = result.replace(
            regex,
            `<span class="highlight" data-tooltip="${reason}">$1</span>`
        );
    });

    return result;
}