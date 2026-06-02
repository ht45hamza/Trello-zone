# 🎨 Trello-Zone Frontend

This is the React-based user interface for the Trello-Zone application. It features a responsive dashboard, drag-and-drop workspace boards, fully interactive list/card managers, checklists, settings panel, and modern secure authentication flows.

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [React](https://react.dev/) (v18.3) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/) (v8.0)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4.0) with custom theme values (Trello brand colors, mesh gradients, glassmorphism utilities)
- **State Management**:
  - **Redux Toolkit**: Manages board operations, list sorting, and card attributes
  - **Zustand**: Manages reactive authentication store, session validation, and profiles
- **Drag and Drop**: [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v7.1)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/) (preconfigured interceptors for automatic JWT refresh)

---

## ⚙️ Setup & Development

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed and the Trello-Zone Backend server running.

### 2. Install Dependencies
Navigate to this directory and install required npm packages:
```bash
npm install
```

### 3. Run Local Server
Start the Vite development server locally:
```bash
npm run dev
```
The client will start running at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
To bundle the frontend application for deployment:
```bash
npm run build
```
This outputs production assets to the `/dist` directory.

### 5. Code Linting
Scan files for code formatting issues and TypeScript errors:
```bash
npm run lint
```

---

## 📂 Key Modules & Files

- **`src/store/`**: Contains the state managers.
  - [boardSlice.ts](file:///d:/DEVSOUL/Trello/frontend/src/store/boardSlice.ts): Slice handling Redux state for boards, lists, and card changes.
  - [useAuthStore.ts](file:///d:/DEVSOUL/Trello/frontend/src/store/useAuthStore.ts): Zustand store handling user login/logout/profile state.
- **`src/components/board/`**: Component files handling the board grid.
  - [BoardView.tsx](file:///d:/DEVSOUL/Trello/frontend/src/components/board/BoardView.tsx): Core view coordinate list mapping and drag-and-drop contexts.
  - [BoardListColumn.tsx](file:///d:/DEVSOUL/Trello/frontend/src/components/board/BoardListColumn.tsx): Lists wrapper mapping individual draggable card components.
  - [CardDetailsModal.tsx](file:///d:/DEVSOUL/Trello/frontend/src/components/board/CardDetailsModal.tsx): Overlay modal containing description editor, labels, members, checklist, and attachments.
- **`src/components/dashboard/`**: User dashboard layout for managing workspace boards, profile settings, and sidebar navigation.
- **`src/index.css`**: Defines Tailwind v4 styling overrides, glassmorphism panels, and animated mesh gradients.
