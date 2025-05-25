# Ứng Dụng Hỗ Trợ Ra Quyết Định AHP

Ứng dụng web hỗ trợ sinh viên ra quyết định về quản lý chi tiêu sử dụng phương pháp Phân tích thứ bậc (Analytic Hierarchy Process - AHP).

## Giới Thiệu

Ứng dụng AHP là một công cụ giúp sinh viên ra quyết định chi tiêu hợp lý khi đối mặt với nhiều lựa chọn và nhiều tiêu chí đánh giá khác nhau. Ứng dụng cung cấp một phương pháp ra quyết định có cấu trúc, cho phép người dùng:

- Xác định các tiêu chí quan trọng (học tập, nơi ở, ăn uống, giải trí, v.v.)
- Thiết lập các phương án chi tiêu cụ thể
- So sánh tầm quan trọng tương đối giữa các tiêu chí và phương án
- Nhận kết quả phân tích dựa trên phương pháp AHP
- Hiểu được lý do tại sao một phương án được đánh giá cao hơn các phương án khác

## Cấu Trúc Dự Án

```
ahp-decision-support/
├── ahp-app/                  # Frontend Next.js
│   ├── public/               # Tài nguyên tĩnh
│   ├── src/                  # Mã nguồn
│   │   ├── app/              # Các trang (App Router)
│   │   │   ├── about/        # Trang giới thiệu
│   │   │   ├── alternatives/ # Trang nhập phương án
│   │   │   ├── alternatives-comparison/ # So sánh phương án
│   │   │   ├── comparison/   # Trang so sánh tiêu chí
│   │   │   ├── create-problem/ # Trang tạo bài toán
│   │   │   ├── results/      # Trang kết quả
│   │   │   ├── page.tsx      # Trang chủ
│   │   │   └── layout.tsx    # Layout chung
│   │   ├── components/       # Các component tái sử dụng
│   │   └── types/            # Định nghĩa kiểu dữ liệu
│   ├── package.json          # Cấu hình dự án
│   └── tsconfig.json         # Cấu hình TypeScript
├── python/                   # Python Service
│   ├── app.py                # API Flask
│   └── requirements.txt      # Thư viện Python
└── memory-bank/              # Tài liệu dự án
```

## Công Nghệ Sử Dụng

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Python Service**: Flask, NumPy
- **Lưu trữ**: localStorage (hiện tại), Supabase (kế hoạch)

## Tính Năng

1. **Chọn Loại Bài Toán AHP**:
   - Chi Tiêu Cho Sinh Viên (với các tiêu chí mặc định)
   - Tạo Mới (tùy chỉnh tiêu chí)
   - Tạo Với AI (đang phát triển)

2. **Quản Lý Tiêu Chí và Phương Án**:
   - Thêm/xóa tiêu chí
   - Thêm/xóa phương án
   - Mô tả chi tiết cho mỗi tiêu chí và phương án

3. **So Sánh Cặp**:
   - So sánh cặp giữa các tiêu chí
   - So sánh cặp giữa các phương án theo từng tiêu chí

4. **Tính Toán AHP**:
   - Kết nối với Python Service để tính toán
   - Hiển thị kết quả dưới dạng biểu đồ và bảng

## Cài Đặt và Sử Dụng

### Yêu Cầu
- Node.js >= 14.x
- Python >= 3.8
- npm >= 6.x hoặc yarn >= 1.22.x

### Cài Đặt
1. Clone repository:
   ```
   git clone https://github.com/FinnyLove/ahp-decision-support.git
   cd ahp-decision-support
   ```

2. Cài đặt dependencies cho frontend:
   ```
   cd ahp-app
   npm install
   ```

3. Cài đặt dependencies cho Python Service:
   ```
   cd ../python
   pip install -r requirements.txt
   ```

### Chạy Ứng Dụng
1. Chạy Python Service:
   ```
   cd python
   python app.py
   ```

2. Chạy frontend:
   ```
   cd ahp-app
   npm run dev
   ```

3. Mở trình duyệt và truy cập: http://localhost:3000

## Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp vào dự án.

## Giấy Phép

Dự án này được phân phối dưới giấy phép MIT.