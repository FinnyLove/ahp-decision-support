# Tổng Quan Dự Án AHP

## Mục Tiêu
Phát triển ứng dụng web hỗ trợ sinh viên ra quyết định về quản lý chi tiêu sử dụng phương pháp Phân tích thứ bậc (Analytic Hierarchy Process - AHP). Ứng dụng cho phép người dùng phân tích và lựa chọn giữa nhiều phương án dựa trên các tiêu chí khác nhau, bằng cách sắp xếp và so sánh chúng theo thứ bậc và mức độ ưu tiên.

## Phạm Vi
- Xây dựng giao diện người dùng thân thiện, dễ sử dụng
- Cung cấp khả năng tạo bài toán AHP với các tiêu chí và phương án tùy chỉnh
- Hỗ trợ so sánh cặp giữa các tiêu chí và phương án
- Tính toán kết quả AHP và hiển thị dưới dạng biểu đồ trực quan
- Cung cấp giải thích chi tiết về kết quả phân tích

## Đối Tượng Người Dùng
- Sinh viên cần ra quyết định về chi tiêu
- Người dùng cần công cụ hỗ trợ ra quyết định đa tiêu chí
- Người dùng không chuyên về phương pháp AHP nhưng muốn áp dụng phương pháp này

## Yêu Cầu Chính
1. Giao diện người dùng trực quan, dễ sử dụng
2. Khả năng tạo, chỉnh sửa và lưu trữ bài toán AHP
3. Tính toán chính xác kết quả AHP
4. Hiển thị kết quả dưới dạng biểu đồ và bảng
5. Hỗ trợ nhiều loại thiết bị (responsive design)
6. Kết nối giữa frontend và backend để xử lý tính toán AHP

## Giới Hạn
- Không yêu cầu đăng nhập/xác thực người dùng
- Không lưu trữ dữ liệu người dùng lâu dài (chỉ sử dụng localStorage)
- Tập trung vào tính năng cốt lõi của phương pháp AHP