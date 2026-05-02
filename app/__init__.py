import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Khởi tạo đối tượng SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # Đảm bảo thư mục instance tồn tại để chứa file history.db
    os.makedirs(app.instance_path, exist_ok=True)

    # Cấu hình đường dẫn cơ sở dữ liệu
    app.config['SQLALCHEMY_DATABASE_URI'] = \
        'sqlite:///' + os.path.join(app.instance_path, 'history.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Khởi tạo các tiện ích mở rộng
    db.init_app(app)
    CORS(app)

    # ĐĂNG KÝ BLUEPRINT
    from .routes import main
    app.register_blueprint(main)

    # TỰ ĐỘNG KHỞI TẠO DATABASE (Thêm đoạn này)
    # Lệnh này giúp kiểm tra: Nếu chưa có file history.db, nó sẽ tự tạo bảng
    with app.app_context():
        from .models import History  # Đảm bảo bạn đã import Model của mình ở đây
        db.create_all()

    return app