# eCommerce Application

## 📌 Overview

This is a full-stack eCommerce application built with **Next.js** for the frontend and **Node.js with Express** for the backend. The project allows users to browse products, add items to their cart, and place orders. Admins can manage products, orders, and users.

## ✨ Features

-   **User Authentication**: JWT-based authentication with role-based access control.
-   **Product Management**: Admins can add, update, and delete products.
-   **Shopping Cart**: Users can add/remove products and adjust quantities.
-   **Order Processing**: Users can place orders and view their order history.
-   **Admin Dashboard**: Overview of orders, sales, and product inventory.
-   **Search & Filtering**: Users can search for products and filter by categories.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **Authentication**: JWT (JSON Web Token)
-   **Caching**: Redis (for performance optimization)

## 📂 Project Structure

```
📁 eCommerce
├── 📂 node_modules        # Thư viện Node.js
├── 📂 src                 # Mã nguồn chính
│   ├── 📂 backend         # API backend
│   │   ├── 📂 auth        # Xác thực người dùng
│   │   ├── 📂 config      # Cấu hình ứng dụng
│   │   ├── 📂 controllers # Xử lý logic request
│   │   ├── 📂 core        # Thành phần cốt lõi của hệ thống
│   │   ├── 📂 dbs         # Kết nối database
│   │   ├── 📂 helper      # Hàm tiện ích chung
│   │   ├── 📂 logger      # Quản lý ghi log
│   │   ├── 📂 middleware  # Xác thực & xử lý lỗi
│   │   ├── 📂 models      # Định nghĩa schema database
│   │   ├── 📂 postman     # Lưu trữ request API mẫu
│   │   ├── 📂 routes      # Định tuyến API
│   │   ├── 📂 services    # Xử lý logic nghiệp vụ
│   │   ├── 📂 utils       # Hàm hỗ trợ chung
│   │   ├── 📂 test        # Kiểm thử ứng dụng
│   │   ├── app.js         # Cấu hình ứng dụng
├── .env                   # Biến môi trường
├── .gitignore             # Loại trừ file khỏi Git
├── nodemon.json           # Cấu hình Nodemon
├── package.json           # Thông tin package Node.js
├── package-lock.json      # Khóa phiên bản dependencies
├── server.js              # Khởi chạy Express server
├── README.md              # Tài liệu dự án
```

````

## 🚀 Installation & Setup
### Clone the Repository
```bash
git clone https://github.com/Grizz0o0/eCommerce.git
cd eCommerce
````

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Environment Variables

Create a `.env` file in the `backend` folder and configure the following:

```
DEV_APP_PORT= <your-develop-app-port>
DEV_DB_HOST= <your-develop-database-host>
DEV_DB_PORT= <your-develop-database-port>
DEV_DB_NAME= <your-develop-database-name>

PRO_APP_PORT= <your-product-app-port>
PRO_DB_HOST= <your-product-database-host>
PRO_DB_PORT= <your-product-database-port>
PRO_DB_NAME= <your-product-database-name>

CHANNELID_DISCORD= <your-discord-id>
TOKEN_DISCORD= <your-discord-token>
```

## 🛠️ API Endpoints

### Authentication

-   `POST /v1//api/shop/signup` - User registration
-   `POST /v1/api/shop/login` - User login
-   `GET /v1/api/shop/me` - Get me
-   `POST /v1/api/shop/logout` - User logout
-   `POST /v1/api/shop/handlerRefreshToken` - User handlerRefreshToken

### Products

-   `POST /v1/api/product` - Add new product (Admin only)
-   `GET /v1/api/product/published/all` - Get all Published
-   `POST /v1/api/product/publish/:id` - Action Published Product
-   `POST /v1/api/product/publish/:id` - Action Published Product
-   `POST /v1/api/product/unpublish/:id` - Action UnPublished Product
-   `GET /v1/api/product/drafts/all` - Get All Drafts
-   `GET /v1/api/product/search/:keySearch` - Get List Search Products
-   `GET /v1/api/product` - Get All Products
-   `GET /v1/api/product/:product_id` - Get Product
-   `PATCH /v1/api/product/:productId` - Update Product
-   `DELETE /v1/api/product/:productId` - Delete Product

### Discount

-   `POST /v1/api/discount` - Create New Discount By Shop
-   `POST /v1/api/discount/amount` - Discount Amount By User
-   `PATCH /v1/api/discount/:discountId` - Update Discount By Shop
-   `PATCH /v1/api/discount/cancel` - Cancel Discount By Shop
-   `DELETE /v1/api/discount/delete` - Delete Discount By Shop
-   `GET /v1/api/discount?shopId=...&limit=...&page=...` - Get List Discount By Shop
-   `GET /v1/api/discount/list_product_code?code=...&shopId=...&limit=...&page=...` - Get Products For Code

### Cart

-   `POST /v1/api/cart` - Add To Cart Item[User]
-   `POST /v1/api/cart/update` - Update To Cart Item[User]

### Comment

-   `POST /v1/api/comment` - Create Comment
-   `GET /v1/api/comment` - Get Comment

## Future Enhancements

-   Implement payment gateway (Stripe, PayPal)
-   Add product reviews & ratings
-   Improve UI with animations and better UX

---

### 🔗 Connect with me

[GitHub](https://github.com/Grizz0o0) | [Gmail](vuonghongky26@gmail.com)
