# Klyro Client

A modern frontend for **Klyro**, a Discord-inspired real-time chat application. Built with React, TypeScript, and Socket.IO to deliver a fast, responsive, and interactive user experience.

> A clean, scalable frontend designed for seamless real-time communication.

---

## ✨ Features

### Authentication
- Secure Login & Signup
- Persistent authentication
- Protected routes
- Automatic session handling

### Servers
- Create and join servers
- Server switching
- Leave servers
- Server navigation sidebar

### Channels
- Browse text and voice channels
- Create channels
- Update and delete channels
- Channel organization

### Messaging
- Real-time messaging
- Infinite message history
- Edit and delete messages
- File attachments
- Auto-scroll to latest messages

### Real-time
- Instant message updates
- Live user connection status
- Socket.IO integration

### UI/UX
- Responsive layout
- Discord-inspired interface
- Loading skeletons
- Toast notifications
- Optimistic UI updates

---

# Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Data Fetching | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| HTTP Client | Axios |
| Real-time | Socket.IO Client |
| Icons | Lucide React |

---

# Project Structure

```
src/
│
├── api/
├── assets/
├── components/
├── features/
│   ├── auth/
│   ├── server/
│   ├── channel/
│   ├── message/
│   └── user/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/
├── types/
├── utils/
└── main.tsx
```

---

# Application Pages

- Authentication
  - Login
  - Register

- Dashboard
  - Server List
  - Channel List
  - Chat Area

- Settings
  - Profile
  - Server Management

---

# Real-Time Features

- Live messaging
- Instant channel updates
- User connection status
- Socket reconnection
- Real-time UI synchronization

---

# State Management

- TanStack Query for server state
- React Hooks for local state
- Optimistic updates
- Automatic cache invalidation
- Background refetching

---

# UI Components

- Reusable component architecture
- Modal dialogs
- Dropdown menus
- Forms with validation
- Toast notifications
- Responsive sidebar
- Loading skeletons

---

# Performance Optimizations

- Lazy-loaded routes
- Component reusability
- React Query caching
- Optimistic updates
- Memoized components
- Efficient re-rendering

---

# Future Improvements

- Voice channels
- Video calls
- Direct messages
- Emoji reactions
- User presence
- Threaded conversations
- Message search
- Theme customization
- Keyboard shortcuts
- Mobile responsiveness
- PWA support

---

# Backend Repository

The backend is available in a separate repository.

```
klyro-server
```

---

# License

MIT

---

## Author

**Abhishek Sharma**

Backend Developer

If you found this project useful, consider giving it a ⭐ on GitHub.