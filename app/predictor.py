import pickle

# ==========================================
# LOAD MODEL
# ==========================================
with open("model/model.pkl", "rb") as f:
    vectorizer, model = pickle.load(f)


# ==========================================
# PREDICT
# ==========================================
def predict_text(text):
    X = vectorizer.transform([text])

    pred = model.predict(X)[0]              # 0 hoặc 1
    probs = model.predict_proba(X)[0]       # [prob_real, prob_fake]

    # ⚠️ QUAN TRỌNG: lấy đúng xác suất của class dự đoán
    confidence = float(probs[pred])

    # mapping label rõ ràng
    result = "Tin Giả" if pred == 1 else "Tin Thật"

    return result, confidence   # ⚠️ để dạng 0–1 (backend sẽ xử lý %)


# ==========================================
# KEYWORD EXTRACTION
# ==========================================

FAKE_KEYWORDS = [
    "sốc", "giật gân", "chưa kiểm chứng",
    "khẩn cấp", "trúng thưởng", "miễn phí",
    "link", "http", "xác thực", "tài khoản",
    "đóng băng", "tri ân"
]

def extract_keywords(text):
    text = text.lower()

    found = []
    for kw in FAKE_KEYWORDS:
        if kw in text:
            found.append(kw)

    return found