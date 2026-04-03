# PQLFood — Ứng dụng bán thực phẩm (MERN)

Dự án web bán đồ ăn / thực phẩm: khách xem danh mục, sản phẩm, giỏ hàng, đặt hàng, thanh toán; quản trị viên quản lý danh mục, sản phẩm, đơn hàng và cấu hình thanh toán / liên hệ.

## Công nghệ sử dụng

| Phần | Công nghệ |
|------|-----------|
| **Frontend** | React 18, Vite 5, React Router 6, Tailwind CSS |
| **Backend** | Node.js, Express 4, Mongoose (MongoDB) |
| **Xác thực** | JWT (`jsonwebtoken`), mật khẩu băm (`bcryptjs`) |
| **Upload** | Multer (ảnh sản phẩm lưu trên server, phục vụ qua `/uploads`) |

## Cấu trúc thư mục

```
mern-pql-food/
├── client/          # Giao diện React (Vite)
│   ├── src/
│   │   ├── pages/   # Trang cửa hàng (home, sản phẩm, giỏ, auth, …)
│   │   └── admin/   # Trang quản trị (/quan-tri/...)
│   └── vite.config.js   # Proxy dev: /api → backend
├── server/          # API Express
│   ├── config/      # Kết nối MongoDB
│   ├── models/      # User, Product, Category, Order, ...
│   ├── routes/      # REST API
│   ├── scripts/     # seed dữ liệu, tạo admin
│   └── uploads/     # ảnh upload (tạo khi chạy, không bắt buộc commit)
└── README.md
```

## Yêu cầu trước khi chạy

- **Node.js** 18+ (khuyến nghị LTS)
- **MongoDB**: cục bộ hoặc [MongoDB Atlas](https://www.mongodb.com/atlas) (chuỗi kết nối `mongodb+srv://...`)

---

## Hướng dẫn từ clone đến chạy local

### Bước 1 — Clone repository

```bash
git clone https://github.com/vietphubdp/pql-food.git
cd mern-pql-food
```

(Nếu không dùng Git, giải nén mã nguồn và `cd` vào thư mục project.)

### Bước 2 — Cấu hình biến môi trường cho server

Trong thư mục `server`, tạo file `.env` (không commit file này nếu repo công khai):

```bash
cd server
copy .env.example .env
```

Trên macOS/Linux:

```bash
cd server && cp .env.example .env
```

Mở `server/.env` và chỉnh:

| Biến | Ý nghĩa |
|------|---------|
| `MONGODB_URI` | Chuỗi kết nối MongoDB (bắt buộc) |
| `JWT_SECRET` | Chuỗi bí mật dài, ngẫu nhiên để ký JWT |
| `PORT` | Cổng API (mặc định 5000; có thể bỏ qua nếu platform tự gán) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Dùng cho script tạo tài khoản admin (tùy chọn) |
| `CLIENT_ORIGIN` | URL frontend cho CORS (local có thể bỏ: mặc định là `http://localhost:5173`) |

### Bước 3 — Cài đặt và chạy API

```bash
cd server
npm install
npm run dev
```

- API mặc định: `http://localhost:5000`
- Kiểm tra: mở trình duyệt hoặc gọi `GET http://localhost:5000/api/health` → phản hồi `{"ok":true}`.

### Bước 4 — Seed dữ liệu mẫu và tài khoản admin (khuyến nghị lần đầu)

Terminal **mới** (giữ server đang chạy hoặc tạm dừng — script chỉ dùng MongoDB):

```bash
cd server
npm run seed          # Danh mục + sản phẩm mẫu
npm run seed:admin    # Tạo / cập nhật user admin (theo ADMIN_EMAIL trong .env)
```

Đăng nhập quản trị tại: `http://localhost:5173/quan-tri/dang-nhap` (sau khi chạy client ở bước sau).

### Bước 5 — Cài đặt và chạy giao diện (client)

Terminal **mới**:

```bash
cd client
npm install
npm run dev
```

- Ứng dụng: `http://localhost:5173`
- Vite tự **proxy** `/api` và `/uploads` sang `http://localhost:5000`, nên **không cần** đặt `VITE_API_BASE_URL` khi dev local (trừ khi bạn tự đổi cổng backend).

### Tóm tắt luồng hằng ngày

1. Terminal 1: `cd server && npm run dev`
2. Terminal 2: `cd client && npm run dev`
3. Mở `http://localhost:5173`

---

## Các lệnh npm hữu ích

| Lệnh | Thư mục | Mô tả |
|------|---------|--------|
| `npm run dev` | `server` | Chạy API với `--watch` (tự restart khi sửa file) |
| `npm start` | `server` | Chạy API một lần (dùng khi deploy) |
| `npm run seed` | `server` | Nạp dữ liệu mẫu |
| `npm run seed:admin` | `server` | Tạo / nâng quyền admin |
| `npm run dev` | `client` | Dev server Vite |
| `npm run build` | `client` | Build production → `client/dist` |
| `npm run preview` | `client` | Xem bản build tại máy |

---

## Build production (client)

```bash
cd client
npm run build
```

Thư mục `client/dist` là static site; có thể deploy lên Vercel, Netlify, v.v.

---

## Deploy gợi ý (tóm tắt)

1. **API (ví dụ [Render](https://render.com))**: Web service Node, build/start trong thư mục `server`, biến môi trường tối thiểu: `MONGODB_URI`, `JWT_SECRET`, và **`CLIENT_ORIGIN`** = URL frontend production (ví dụ `https://ten-du-an.vercel.app`).
2. **Frontend (ví dụ [Vercel](https://vercel.com))**: Root directory = `client`, build `npm run build`, output `dist`.
3. Trên Vercel thêm **`VITE_API_BASE_URL`** = URL API công khai **không** có dấu `/` cuối (ví dụ `https://ten-api.onrender.com`), rồi **Redeploy** để Vite nhúng biến vào bundle.

Chi tiết CORS và cấu hình tùy chọn `vercel.json` (rewrite) có thể bổ sung trong project theo nhu cầu; code client đọc base API từ `client/src/config/apiBase.js`.

---

## Ghi chú

- Ảnh upload lưu trên đĩa server: trên một số nền tảng cloud filesystem **không bền**; production lâu dài nên cân nhắc S3, Cloudinary, v.v.
- Đừng commit `server/.env` hoặc `client/.env` chứa mật khẩu thật; dùng `.env.example` làm mẫu.

Nếu API chạy nhưng trình duyệt báo lỗi CORS, kiểm tra `CLIENT_ORIGIN` trên server có **khớp chính xác** scheme + host + port của trang web (nếu có) mà người dùng đang mở.
