# National Contest Lookup Frontend

Ứng dụng tra cứu điểm thi Đại học quốc gia được xây dựng bằng React + Vite với giao diện hiện đại, responsive và tích hợp API.

## 🚀 Tính năng chính

- **Tra cứu điểm thi**: Tra cứu điểm số theo số báo danh
- **Dashboard**: Biểu đồ phân bố điểm số theo môn học + Top 10 thí sinh
- **Báo cáo**: Xem chi tiết top 10 thí sinh có điểm cao nhất
- **Responsive Design**: Giao diện thân thiện trên mọi thiết bị
- **API Integration**: Tích hợp với backend API thực tế

## 🛠️ Công nghệ sử dụng

- **React 19.1.0**: Framework JavaScript hiện đại
- **Vite 7.0.4**: Build tool nhanh với HMR
- **React Router DOM 7.7.0**: Routing cho SPA
- **Axios 1.6.7**: HTTP client cho API calls
- **CSS3**: Styling với custom properties và responsive design

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0 hoặc yarn >= 1.22.0

## 🏃‍♂️ Cách chạy project

### 1. Clone repository

```bash
git clone https://github.com/peterngy3n/national-contest-lookup-frontend.git
cd national-contest-lookup-frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

hoặc nếu sử dụng yarn:

```bash
yarn install
```

### 3. Cấu hình API endpoint

Mở file `src/constant/baseURL.js` và cập nhật URL API:

```javascript
export const BASEURL = "https://your-api-domain.com/api";
```

### 4. Chạy development server

```bash
npm run dev
```

hoặc:

```bash
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 5. Build cho production

```bash
npm run build
```

hoặc:

```bash
yarn build
```

Files build sẽ được tạo trong thư mục `dist/`