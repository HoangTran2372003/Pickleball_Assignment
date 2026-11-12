# ĐỒ ÁN ASSIGNMENT FER202: WEBSITE HỌC VIỆN ĐÀO TẠO PICKLEBALL

> **Môn học**: Front-End Web Development (FER202)  
> **Đề tài**: Xây dựng Website Học Viện Đào Tạo Pickleball  
> **Công nghệ**: ReactJS, React Router DOM, Axios, Bootstrap 5, Bootstrap Icons, JSON-Server  

---

## 1. Mục Tiêu & Cấu Trúc Dự Án

Dự án xây dựng một trang web hoàn chỉnh, hiện đại và chuẩn responsive (đặc biệt tối ưu trên màn hình di động từ 320px đến 428px) cho Học Viện Đào Tạo Pickleball.

### Kiến Trúc Thư Mục
```text
pickleball_assignment/
├── database.json               # Database mock RESTful API dùng cho json-server
├── package.json                # Dependencies: react, react-router-dom, axios, bootstrap
├── public/
└── src/
    ├── App.js                  # Chỉ chứa BrowserRouter và các Routes điều hướng
    ├── index.js                # Điểm khởi chạy app, import Bootstrap & CSS
    ├── index.css               # Styling tùy biến, hỗ trợ responsive di động
    ├── context/
    │   └── AuthContext.js      # Quản lý phân quyền Role (Admin, Học viên, Khách vãng lai)
    └── components/             # TẤT CẢ các trang và component của web
        ├── Navbar.js           # Header điều hướng, hamburger menu & Role Switcher
        ├── Footer.js           # Footer thông tin học viện, hotline, mạng xã hội
        ├── Home.js             # Trang chủ: Banner, CSVC, HLV, Khóa học nổi bật, Testimonials
        ├── Courses.js          # Trang khóa học: Lọc, tìm kiếm, xem chi tiết giáo trình
        ├── Register.js         # Trang đăng ký học: Form validation regex SĐT/Email
        ├── AboutContact.js     # Trang giới thiệu: Lịch sử, bản đồ Google Maps, form liên hệ
        ├── CourtBooking.js     # [Mở rộng 1] Hệ thống đặt sân tập theo giờ (có tránh trùng lịch, vé QR)
        ├── Shop.js             # [Mở rộng 2] Cửa hàng bán dụng cụ & Modal Checkout đơn hàng
        ├── AdminDashboard.js   # [Quản trị] Duyệt lịch đặt sân & cập nhật trạng thái đơn hàng
        ├── MyAccount.js        # [Học viên] Xem lịch sử đặt sân & theo dõi đơn hàng cá nhân
        └── Login.js            # [Xác thực] Trang đăng nhập phân quyền Admin & Học viên
```

---

## 2. Báo Cáo Phân Tích Nghiệp Vụ (BA) - 2 Chức Năng Mở Rộng

Theo yêu cầu đề bài, sinh viên đóng vai trò là một chuyên viên phân tích nghiệp vụ (BA) để khảo sát nhu cầu thực tế của một học viện thể thao Pickleball chuyên nghiệp. Nhóm đã đề xuất và triển khai **2 chức năng mở rộng**:

### Chức năng mở rộng 1: Hệ thống Đặt Sân Tập Theo Giờ (Court Booking System)
* **Vấn đề thực tế (Pain Point)**: Pickleball đang phát triển bùng nổ, nhu cầu tìm sân tập luyện ngoài giờ học là cực kỳ lớn. Học viên sau khi kết thúc khóa học cần có sân để thực hành kỹ thuật, đồng thời học viện cần tối ưu hóa công suất khai thác sân bãi vào các khung giờ trống để gia tăng doanh thu.
* **Giải pháp triển khai (`CourtBooking.js`)**:
  - Cung cấp danh sách các cụm sân trong nhà (Indoor) và ngoài trời (Outdoor) đạt tiêu chuẩn USA Pickleball.
  - Cho phép người chơi chủ động chọn ngày, chọn khung giờ (ca 2 tiếng), phân biệt giá giờ thấp điểm và cao điểm.
  - Tự động tính tổng tiền thuê sân theo thời lượng đặt.
  - Form xác nhận thông tin người đặt có kiểm tra validation và lưu trực tiếp vào cơ sở dữ liệu `courtBookings`.
  - Hiển thị danh sách các lượt đặt sân gần đây để người chơi nắm được tình trạng sân.

### Chức năng mở rộng 2: Cửa Hàng Bán Dụng Cụ Pickleball (Pro Shop & Equipment)
* **Vấn đề thực tế (Pain Point)**: Học viên mới thường gặp khó khăn trong việc chọn vợt phù hợp với kích thước bàn tay, lực cổ tay và lối chơi (Control vs Power). Mua ngoài thị trường dễ gặp hàng giả, kém chất lượng gây chấn thương (viêm gân khuỷu tay - Tennis Elbow).
* **Giải pháp triển khai (`Shop.js`)**:
  - Cung cấp các dòng vợt thi đấu chính hãng (Joola, Selkirk, Franklin), bóng thi đấu chuẩn 40 lỗ (Franklin X-40), giày thể thao chuyên dụng Asics và balo phụ kiện.
  - Phân loại danh mục rõ ràng (Vợt, Bóng, Giày, Phụ kiện).
  - Modal xem chi tiết thông số kỹ thuật (độ dày lõi, chất liệu mặt carbon, trọng lượng...).
  - Giỏ hàng mini: Cho phép thêm sản phẩm, tăng/giảm số lượng, tính tổng giá trị đơn hàng và thao tác đặt mua tiện lợi.

---

## 3. Hướng Dẫn Cài Đặt & Khởi Chạy Dự Án

### Bước 1: Cài đặt dependencies (nếu chưa cài)
```bash
npm install
```

### Bước 2: Chạy Backend Mock Server (JSON-Server)
Mở một terminal và chạy lệnh:
```bash
npm run server
# Hoặc: json-server --watch database.json --port 9999
```
Server sẽ chạy tại địa chỉ: `http://localhost:9999` với đầy đủ các API:
- `http://localhost:9999/academyInfo`
- `http://localhost:9999/facilities`
- `http://localhost:9999/coaches`
- `http://localhost:9999/courses`
- `http://localhost:9999/registrations`
- `http://localhost:9999/courts`
- `http://localhost:9999/courtBookings`
- `http://localhost:9999/products`
- `http://localhost:9999/contacts`

### Bước 3: Khởi chạy ứng dụng React
Mở một terminal khác và chạy lệnh:
```bash
npm start
```
Ứng dụng sẽ tự động mở tại trình duyệt: `http://localhost:3000`.

---

## 4. Kiểm Thử Giao Diện & Tiêu Chí Đánh Giá (Rubric)

* **Giao diện & Responsive (30% điểm)**:
  - Bật F12 trên trình duyệt và chuyển sang chế độ thiết bị di động (Mobile Device Toolbar).
  - Kiểm tra kích thước từ **320px đến 428px** (iPhone SE, iPhone 12/13/14 Pro).
  - Layout không bị tràn ngang (`overflow-x`), menu hamburger co giãn mượt mà, card và button hiển thị cân đối.
* **Form & Validation (10% điểm)**:
  - Trang Đăng Ký (`/register`): Bắt buộc nhập Họ tên, kiểm tra regex SĐT 10 số Việt Nam (`03x, 05x, 07x, 08x, 09x`), kiểm tra cú pháp email hợp lệ, bắt buộc chọn khóa học.
  - Trang Liên Hệ (`/about-contact`): Bắt lỗi trường trống và định dạng email.
  - Trang Đặt Sân (`/court-booking`): Bắt lỗi chọn sân, ngày và thông tin người đặt.
