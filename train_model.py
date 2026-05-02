from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

# dữ liệu mẫu (bạn có thể thay bằng data Kaggle sau)
texts = [
    "Tin này rất sốc và chưa kiểm chứng",
    "Đây là thông tin chính thức từ chính phủ",
    "Tin giật gân gây hoang mang dư luận",
    "Báo cáo khoa học đã được xác nhận"
]

labels = [1, 0, 1, 0]  # 1 = Fake, 0 = Real

# vector hóa
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# train model
model = LogisticRegression()
model.fit(X, labels)

# tạo folder model
os.makedirs("model", exist_ok=True)

# lưu cả model + vectorizer
with open("model/model.pkl", "wb") as f:
    pickle.dump((vectorizer, model), f)

print("Model saved!")