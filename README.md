# 🚀 Trello-Zone

A modern, full-featured **Trello Clone** web application built with a high-performance stack. This application replicates core Trello features such as workspaces, boards, dynamic drag-and-drop lists, card management, due dates, file attachments, member assignment, label tagging, checklists, and comprehensive user account management.

The project features a sleek, premium design utilizing modern web design paradigms such as **glassmorphism**, dynamic **mesh gradients**, interactive animations, and responsive layouts.

---

## 🏗️ Tech Stack

### Frontend
- **Core**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (v4) with custom themes, CSS variables, and fluid transitions
- **State Management**:
  - **Redux Toolkit**: Manages board, list, and card states for heavy transactional logic
  - **Zustand**: Manages lightweight user session and authentication states
- **Drag & Drop**: React Beautiful DnD
- **Icons**: Lucide React
- **HTTP Client**: Axios (configured with interceptors for token refresh)

### Backend
- **Core**: Node.js, Express, TypeScript
- **Database**: MongoDB (via Mongoose Object Data Modeling)
- **Security & Auth**: JSON Web Tokens (JWT) with Refresh Token cycle, BcryptJS for secure password hashing
- **Media Upload**: Multer (local parsing) combined with Cloudinary SDK for cloud-based media storage
- **Validation**: Express Validator for strict input sanitization

---

## 🎨 Key Features

- **🔐 Robust Auth System**: Secure user registration, login, email OTP verification, password reset, and session recovery via refresh tokens.
- **📋 Collaborative Boards**: Create boards with customized background colors or custom uploaded images. Boards can be starred/unstarred for quick access.
- **🔄 Smooth Drag & Drop**: Move cards between lists or reorder lists and cards seamlessly using native drag-and-drop mechanics.
- **🏷️ Rich Card Editing**:
  - Assign members to tasks.
  - Tag cards using customizable colored labels.
  - Set specific due dates.
  - Upload file and image attachments (integrated with Cloudinary).
  - Add nested checklists (activities) with progress tracking.
- **👤 Settings & Customization**: Update user details and change passwords.
- **✨ Premium UI**: Responsive sidebar navigation, custom modern scrollbars, glassmorphic inputs/panels, and animated background grids.

---

## 📁 Directory Structure

```text
Trello/
├── backend/                  # Express REST API Server
│   ├── config/               # Database connection setup
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth, file upload, & validation middlewares
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API endpoint definitions
│   ├── utils/                # Error handling and helper utilities
│   ├── server.ts             # Backend entry point
│   └── tsconfig.json         # Backend TypeScript config
│
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── api/              # Axios configuration & client
│   │   ├── components/       # UI Components (auth, board, dashboard, common, etc.)
│   │   ├── hooks/            # Reusable custom hooks
│   │   ├── routes/           # React Router DOM configuration
│   │   ├── store/            # Redux & Zustand stores
│   │   ├── index.css         # Tailwind directives & CSS theme variables
│   │   └── main.tsx          # Client entry point
│   ├── vite.config.js        # Vite bundler configurations
│   └── tsconfig.json         # Frontend TypeScript config
│
└── package.json              # Root package control
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or a local MongoDB database instance
- [Cloudinary](https://cloudinary.com/) account for image & attachment hosting

### 1. Clone & Install Dependencies
Run the following command at the project root to install the shared dev tools:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 2. Environment Variables Configuration

Create a `.env` file in the `backend/` directory (you can copy `.env.example` as a starting point):

```bash
cd ../backend
cp .env.example .env
```

Open `.env` and fill in your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

### 3. Running the Application

You can spin up both services from the root folder or run them independently.

#### Option A: Running Concurrently (Recommended)
You can start both frontend and backend concurrently from the root directory:
```bash
# In the root directory
npm run dev
```

#### Option B: Running Independently
If you wish to debug individual services:

**Start the Backend server:**
```bash
cd backend
npm run dev
```
The server will start on [http://localhost:5000](http://localhost:5000).

**Start the Frontend server:**
```bash
cd frontend
npm run dev
```
The Vite app will start on [http://localhost:5173](http://localhost:5173).

---

## 🌐 API Endpoint Documentation

All backend endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| **POST** | `/auth/register` | Register a new user | No |
| **POST** | `/auth/login` | Login user (returns JWT & Refresh Token) | No |
| **POST** | `/auth/refresh-token` | Generate new access token | No |
| **POST** | `/auth/forgot-password` | Send OTP for password recovery | No |
| **POST** | `/auth/verify-otp` | Verify OTP | No |
| **POST** | `/auth/reset-password` | Set new password via verified OTP | No |
| **GET** | `/auth/profile` | Retrieve active user profile | **Yes** |
| **PUT** | `/auth/profile/avatar` | Upload and update profile avatar | **Yes** |
| **POST** | `/auth/logout` | Clear user session & token blacklist | **Yes** |
| **POST** | `/auth/change-password` | Change password for authenticated users | **Yes** |

### Boards (`/api/boards`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| **POST** | `/boards` | Create a new board | **Yes** |
| **GET** | `/boards` | Get all boards owned or participated in | **Yes** |
| **GET** | `/boards/:id` | Fetch specific board detail by ID | **Yes** |
| **PUT** | `/boards/:id` | Update board title, description, backgrounds | **Yes** |
| **DELETE** | `/boards/:id` | Delete board | **Yes** |
| **PUT** | `/boards/:id/star` | Toggle starred status of the board | **Yes** |

### Lists (`/api/lists`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| **POST** | `/lists` | Create a new list | **Yes** |
| **GET** | `/lists/board/:board_id` | Get all lists within a specific board | **Yes** |
| **PUT** | `/lists/:id` | Rename or modify a list | **Yes** |
| **DELETE** | `/lists/:id` | Delete a list and all its references | **Yes** |
| **POST** | `/lists/reorder` | Update list order positions (Drag & Drop) | **Yes** |

### Cards (`/api/cards`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| **POST** | `/cards` | Create a new card | **Yes** |
| **GET** | `/cards/board/all` | Fetch all cards associated with a board | **Yes** |
| **GET** | `/cards/list/:list_id` | Fetch all cards inside a list | **Yes** |
| **GET** | `/cards/:id` | Retrieve detailed card information | **Yes** |
| **PUT** | `/cards/:id` | Update card title, members, labels, due date, etc. | **Yes** |
| **DELETE** | `/cards/:id` | Delete a card | **Yes** |
| **POST** | `/cards/reorder` | Change position index of cards inside a list | **Yes** |
| **POST** | `/cards/move` | Move card across different lists | **Yes** |
| **POST** | `/cards/:id/activities` | Add checklist activity / checklist item image | **Yes** |
| **PUT** | `/cards/:id/activities/:activity_id` | Edit or toggle checklist item completion | **Yes** |
| **DELETE** | `/cards/:id/activities/:activity_id` | Delete checklist activity item | **Yes** |

---

## 📜 Development Scripts

### Root Project
- `npm run dev`: Runs the backend and frontend concurrently (requires updating root package scripts).

### Backend Project
- `npm run dev`: Starts Express development server using `nodemon` and `ts-node`.
- `npm run build`: Compiles TypeScript files into JavaScript in `/dist`.
- `npm run start`: Runs compiled production build.

### Frontend Project
- `npm run dev`: Starts Vite local development server.
- `npm run build`: Bundles the application with Rollup/Vite for production release.
- `npm run lint`: Validates source code syntax issues using ESLint.
- `npm run preview`: Serves production-built bundle locally for testing.
