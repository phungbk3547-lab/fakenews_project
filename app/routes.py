from flask import Blueprint, request, jsonify, render_template
from .models import History
from . import db
from .predictor import predict_text, extract_keywords

from datetime import timezone, timedelta

main = Blueprint("main", __name__)

# ==========================================
# KEYWORDS
# ==========================================

SUSPICIOUS_KEYWORDS = [
    "trúng thưởng", "miễn phí", "khẩn cấp", "xác thực ngay",
    "nhấn vào link", "50 triệu", "tri ân khách hàng",
    "đóng băng tài khoản", "vứt bỏ sim",
    "cảnh báo khẩn", "chia sẻ gấp", "link", "http"
]

COMMON_FAKE_WORDS = [
    "sẽ", "các", "là", "có_thể", "không", "trong", "của",
    "và", "để", "hoàn_toàn", "có", "một", "vào",
    "bị", "được", "người", "năm", "việc", "bạn", "trên"
]

# ==========================================
# ROUTES
# ==========================================

@main.route("/")
def home():
    return render_template("index.html")


@main.route("/history")
def history_page():
    return render_template("history.html")


@main.route("/stats")
def stats_page():
    return render_template("stats.html")


# ==========================================
# PREDICT API
# ==========================================

@main.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # =============================
    # 1. AI MODEL
    # =============================
    ai_result, ai_confidence = predict_text(text)
    keywords = extract_keywords(text)

    try:
        ai_confidence = float(ai_confidence)
    except:
        ai_confidence = 0.0

    # nếu dạng 0–1 → đổi sang %
    if ai_confidence <= 1:
        ai_confidence *= 100

    ai_confidence = max(0, min(ai_confidence, 100))

    # =============================
    # 2. HEURISTIC
    # =============================
    text_lower = text.lower()

    suspicious_words = [w for w in SUSPICIOUS_KEYWORDS if w in text_lower]
    suspicious_count = len(suspicious_words)

    common_count = sum(1 for w in COMMON_FAKE_WORDS if w in text_lower)

    final_result = str(ai_result)
    final_confidence = ai_confidence

    is_real = any(x in final_result for x in ["Thật", "Real", "real"])

    # =============================
    # 3. LOGIC QUYẾT ĐỊNH
    # =============================

    if suspicious_count >= 2:
        final_result = "Tin Giả"
        final_confidence = min(85 + suspicious_count * 3, 98)

    elif is_real and suspicious_count >= 1:
        final_result = "Tin Giả"
        final_confidence = min(75 + suspicious_count * 4, 95)

    elif common_count >= 10 and suspicious_count >= 1:
        final_result = "Tin Giả"
        final_confidence = min(70 + common_count * 0.5, 90)

    # =============================
    # 4. SAVE DB
    # =============================
    record = History(
        content=text,
        result=final_result,
        confidence=round(final_confidence, 2)
    )

    db.session.add(record)
    db.session.commit()

    # =============================
    # 5. RESPONSE
    # =============================
    return jsonify({
        "result": final_result,
        "confidence": round(final_confidence, 2),
        "keywords": keywords,
        "danger_words": suspicious_words,  # 🔥 frontend highlight
        "debug": {
            "suspicious_count": suspicious_count,
            "common_count": common_count
        }
    })


# ==========================================
# HISTORY API
# ==========================================

@main.route("/get-history", methods=["GET"])
def get_history():
    records = History.query.order_by(History.created_at.desc()).all()

    VN_TZ = timezone(timedelta(hours=7))

    data = []

    for r in records:
        # ép timezone về UTC nếu chưa có
        if r.created_at.tzinfo is None:
            dt = r.created_at.replace(tzinfo=timezone.utc)
        else:
            dt = r.created_at

        # convert sang giờ VN
        vn_time = dt.astimezone(VN_TZ)

        # 🔥 lấy keyword để highlight
        danger_words = extract_keywords(r.content)

        data.append({
            "id": r.id,
            "content": r.content,
            "result": r.result,
            "confidence": r.confidence,
            "created_at": vn_time.isoformat(),
            "danger_words": danger_words
        })

    return jsonify(data)