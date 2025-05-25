# Bối Cảnh Kỹ Thuật

## Công Nghệ Sử Dụng

### Frontend
- **Framework**: Next.js 13+ với App Router
- **Ngôn ngữ**: TypeScript
- **CSS**: Tailwind CSS
- **Thư viện UI**: Headless UI, React Icons
- **Thư viện biểu đồ**: Chart.js, React-Chartjs-2
- **Quản lý trạng thái**: React Context API, useState
- **Lưu trữ cục bộ**: localStorage

### Backend
- **Node.js**: Express API
- **Middleware**: CORS, body-parser

### Python Service
- **Framework**: Flask
- **Thư viện tính toán**: NumPy
- **API**: RESTful API với JSON
- **CORS**: flask-cors

### Cơ sở dữ liệu
- **Supabase**: Được đề cập trong kế hoạch nhưng chưa triển khai
- **Hiện tại**: Sử dụng localStorage để lưu trữ dữ liệu tạm thời

## Môi Trường Phát Triển
- **IDE**: VS Code hoặc tương tự
- **Quản lý gói**: npm/yarn
- **Môi trường Python**: venv
- **Kiểm soát phiên bản**: Git

## Yêu Cầu Kỹ Thuật
- Node.js >= 14.x
- Python >= 3.8
- npm >= 6.x hoặc yarn >= 1.22.x

## Cấu Trúc Dự Án
```
ahp_v1.2.1/
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
└── Ví dụ AHP/                # Tài liệu và ví dụ
```

## API Endpoints

### Python Service API
- **URL**: http://localhost:5001/calculate
- **Method**: POST
- **Body**:
  ```json
  {
    "criteria_matrix": number[][],
    "alternatives_matrices": number[][][],
    "criteria_names": string[],
    "alternative_names": string[]
  }
  ```
- **Response**:
  ```json
  {
    "criteria_weights": number[],
    "criteria_consistency": {
      "lambda_max": number,
      "ci": number,
      "ri": number,
      "cr": number,
      "is_consistent": number
    },
    "alternatives_weights": number[][],
    "alternatives_consistency": any[],
    "final_scores": number[],
    "criteria_names": string[],
    "alternative_names": string[]
  }
  ```

## Phụ Thuộc Chính

### Frontend
```json
{
  "dependencies": {
    "next": "^13.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "chart.js": "^4.x",
    "react-chartjs-2": "^5.x"
  }
}
```

### Python Service
```
flask==2.0.1
flask-cors==3.0.10
numpy==1.22.4
gunicorn==20.1.0
```

## Giới Hạn Kỹ Thuật
- Không có xác thực người dùng
- Không có cơ sở dữ liệu bền vững (chỉ sử dụng localStorage)
- Không có tính năng đồng bộ hóa dữ liệu giữa các thiết bị
- Python Service cần được chạy cục bộ để ứng dụng hoạt động đầy đủ