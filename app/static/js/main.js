async function checkNews() {
    const inputNews = document.getElementById('newsInput').value;
    if(inputNews.trim() === "") return alert("Vui lòng nhập nội dung tin tức!");

    const btnPredict = document.getElementById('btnPredict');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');

    // Loading
    btnPredict.disabled = true;
    btnText.textContent = "Đang xử lý...";
    btnSpinner.classList.remove('d-none');

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputNews })
        });

        const data = await response.json();

        if(data.error) {
            alert("Lỗi: " + data.error);
            return;
        }

        const resultCard = document.getElementById('resultCard');
        const predictionBadge = document.getElementById('predictionBadge');
        resultCard.classList.remove('d-none');

        // ✅ FIX: KHÔNG nhân 100 nữa
        const confidencePercent = data.confidence.toFixed(2);

        // ✅ FIX LABEL
        if (data.result === "Tin Giả") {
            predictionBadge.textContent = `Cảnh báo: Tin Giả (${confidencePercent}%)`;
            predictionBadge.className = "badge bg-danger fs-6";
        } else {
            predictionBadge.textContent = `Tin Thật (${confidencePercent}%)`;
            predictionBadge.className = "badge bg-success fs-6";
        }

        // =============================
        // 🔥 HIGHLIGHT TỪ NGUY HIỂM
        // =============================
        let highlightedHTML = inputNews;

        if(data.danger_words && data.danger_words.length > 0) {
            data.danger_words.forEach(word => {
                const regex = new RegExp(`(${word})`, 'gi');
                highlightedHTML = highlightedHTML.replace(
                    regex,
                    '<span class="danger">$1</span>'
                );
            });
        }

        document.getElementById('highlightedText').innerHTML = highlightedHTML;

    } catch (error) {
        alert("Lỗi kết nối Server!");
        console.error(error);
    } finally {
        btnPredict.disabled = false;
        btnText.textContent = "Dự đoán ngay";
        btnSpinner.classList.add('d-none');
    }
}