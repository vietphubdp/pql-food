# PQLFood — MERN

Ứng dụng bán thực phẩm: React (Vite) + Express + MongoDB.

## Deploy frontend lên Vercel

Vercel phù hợp cho **ứng dụng React** trong thư mục `client/`. **API Express** (`server/`) không chạy trực tiếp trên Vercel dạng server lâu dài như hiện tại; bạn cần deploy API lên dịch vụ Node riêng (ví dụ [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io)) và dùng [MongoDB Atlas](https://www.mongodb.com/atlas).

Luồng tổng quát:

1. Deploy **server** + cấu hình **MongoDB** + biến môi trường.
2. Cập nhật **CORS** trên server cho domain Vercel.
3. Deploy **client** trên Vercel và đặt **`VITE_API_BASE_URL`** trỏ tới URL API (hoặc dùng `vercel.json` rewrite như bước 4 tùy chọn).

---

### Bước 1: Deploy API (trước Vercel)

1. Tạo cluster MongoDB Atlas, lấy chuỗi `MONGODB_URI`.
2. Trên hosting Node (ví dụ Render **Web Service**):
   - **Build command**: `cd server && npm install` (hoặc root script tương đương).
   - **Start command**: `cd server && npm start` (hoặc `node server/index.js`).
   - **Biến môi trường** (tối thiểu):
     - `MONGODB_URI` — connection string Atlas.
     - `JWT_SECRET` — chuỗi bí mật ký JWT (đủ dài, ngẫu nhiên).
     - `CLIENT_ORIGIN` — URL frontend sau khi có, ví dụ `https://ten-du-an.vercel.app`.
     - `PORT` — thường host tự gán; nếu cần thì khớp với cấu hình platform.
3. Ghi lại **URL công khai** của API, ví dụ: `https://pqlfood-api.onrender.com`.

Kiểm tra: mở `https://<API_URL>/api/health` → `{"ok":true}`.

---

### Bước 2: CORS

Trong `server/index.js`, CORS dùng `process.env.CLIENT_ORIGIN`. Sau khi có domain Vercel, đặt:

`CLIENT_ORIGIN=https://<ten-du-an>.vercel.app`

(Nếu cần nhiều origin, bạn có thể mở rộng cấu hình `cors` trong code sau.)

---

### Bước 3: Tạo project trên Vercel

1. Đăng nhập [vercel.com](https://vercel.com), **Add New Project** → import repo Git chứa project này.
2. **Root Directory**: chọn `client` (quan trọng — để build đúng Vite).
3. **Framework Preset**: Vite (thường tự nhận).
4. **Build Command**: `npm run build` (mặc định).
5. **Output Directory**: `dist` (mặc định Vite).

6. **Biến môi trường (bắt buộc để gọi API Render)** — Vercel → Project → **Settings → Environment Variables**:
   - `VITE_API_BASE_URL` = URL API công khai **không** có dấu `/` cuối, ví dụ `https://pqlfood-api.onrender.com`.

Sau khi thêm/sửa biến, chạy **Redeploy** (Vite nhúng giá trị vào bundle lúc build).

---

### Bước 4 (tùy chọn): Rewrite `vercel.json` thay cho `VITE_API_BASE_URL`

Nếu bạn **không** dùng `VITE_API_BASE_URL`, có thể để client gọi đường dẫn tương đối và dùng rewrite trên Vercel.

Trong thư mục **`client`**, tạo `vercel.json` (thay `YOUR_API_HOST` bằng host API, không dấu `/` cuối):

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR_API_HOST/api/:path*"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://YOUR_API_HOST/uploads/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- Hai rewrite đầu chuyển API và ảnh upload về backend.
- Rewrite cuối là **fallback SPA**.

Repo hiện tại ưu tiên **`VITE_API_BASE_URL`** trong code (`client/src/config/apiBase.js`); khi biến này có giá trị, fetch và ảnh `/uploads/...` đều trỏ thẳng tới API.

---

### Bước 5: Tài khoản admin và dữ liệu

- Tạo admin: dùng script seed trong `server` (xem `package.json` — `seed`, `seed:admin`) hoặc đăng ký rồi đổi `role` trong MongoDB.
- Upload ảnh sản phẩm lưu trên disk server: trên một số platform filesystem **không bền** (ephemeral); production lâu dài nên cân nhắc lưu file lên **S3**, **Cloudinary**, v.v.

---

### Kiểm tra sau deploy

- Mở URL Vercel: trang chủ, đăng nhập, gọi API.
- DevTools → Network: request `/api/...` phải **200** (hoặc lỗi rõ ràng từ API), không 404 từ Vercel.
- Nếu lỗi CORS: kiểm tra lại `CLIENT_ORIGIN` trùng **chính xác** scheme + host Vercel (có/không `www`).

---

### Cấu trúc thư mục tham khảo

| Thư mục  | Vai trò                          |
|----------|-----------------------------------|
| `client` | React + Vite → deploy **Vercel** |
| `server` | Express + MongoDB → host Node riêng |

---

### Chạy local (tóm tắt)

```bash
# Terminal 1 — MongoDB đã có sẵn, tạo server/.env với MONGODB_URI, JWT_SECRET
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

Client: `http://localhost:5173` — proxy tới API `http://localhost:5000` (theo `vite.config.js`).
