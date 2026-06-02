# ⚙️ Trello-Zone Backend

This is the Express-based REST API server for Trello-Zone. It provides secure JWT authentication, data validation, and handles MongoDB persistence for boards, lists, cards, checklists, and uploads.

---

## 🛠️ Tech Stack & Architecture

- **Runtime Environment**: Node.js
- **Server Framework**: Express.js
- **Language**: TypeScript (compiled with `tsconfig.json`)
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with Refresh Tokens stored in DB & HttpOnly cookies
- **Password Security**: BcryptJS for hashing
- **File Uploads**: Multer middleware paired with Cloudinary cloud storage SDK
- **Development Tooling**: Nodemon + ts-node for live reloading

---

## ⚙️ Configuration & Setup

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a MongoDB instance (or Atlas account) ready.

### 2. Install Dependencies
Navigate to this directory and install packages:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in this directory based on the `.env.example` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

### 4. Running the Server

**Start in Development Mode (Live reload):**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Run in Production:**
```bash
npm run start
```

---

## 📂 Key Architecture Modules

- **`index.ts`**: The main entry point initializing middleware (CORS, Express JSON parsing, request logger), routes mapping, and global error handling middleware.
- **`models/`**: Defines database schemas.
  - [UserModel.ts](file:///d:/DEVSOUL/Trello/backend/models/UserModel.ts): Custom User database schema with encryption and OTP fields.
  - [BoardModel.ts](file:///d:/DEVSOUL/Trello/backend/models/BoardModel.ts): Boards table mapping owners, members, and custom styling presets.
  - [ListModel.ts](file:///d:/DEVSOUL/Trello/backend/models/ListModel.ts): Board columns tracking position index.
  - [CardModel.ts](file:///d:/DEVSOUL/Trello/backend/models/CardModel.ts): Cards detail storing label arrays, assignees, checklists, and attachments.
- **`controllers/`**: Contains core request-response controllers handling database queries and business logic.
- **`routes/`**: Handles REST router endpoints routing logic to controllers.
- **`middleware/`**:
  - `AuthMiddleware.ts`: Authenticates request headers and guards endpoints.
  - `MulterMiddleware.ts`: Configures local temp storage files for uploads.
  - `Validators.ts`: Express-validator schemas verifying fields for all forms.
