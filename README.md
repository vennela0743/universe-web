# 🌌 UniVerse

**UniVerse – From Conversations to Collaborations**

A campus-only social platform for university students to connect, collaborate, and grow together. Built with a beautiful space-themed UI featuring an interactive solar system navigation.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green?logo=spring)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

## ✨ Features

### 🔐 Authentication & Security
- **Email Verification**: OTP-based signup requiring `.edu` email addresses
- **Password Reset**: Secure OTP-based password recovery
- **Role-Based Access Control**: ADMIN and STUDENT roles
- **JWT Authentication**: Secure token-based auth with Spring Security
- **University Scoping**: All content isolated by university domain

### 🌐 Spaces

| Space | Description |
|-------|-------------|
| **Connect** | Instagram-style social feed with photo posts, likes, and comments |
| **Pro-Space** | Professional collaboration hub for hackathons, projects, and research opportunities |
| **Events** | Campus event and hackathon listings with admin approval workflow |
| **DM** | Direct messaging with real-time conversation support |
| **My Posts** | Personal dashboard to manage all your content across spaces |

### 🎨 UI/UX
- **Solar System Navigation**: Interactive planetary UI representing different spaces
- **Glass Morphism**: Beautiful frosted glass card designs
- **Starfield Background**: Immersive space-themed aesthetic
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Easy on the eyes, perfect for late-night studying

## 🏗️ Architecture

```
universe-web/
├── frontend/          # Next.js 16 (React 19, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/       # App router pages and layouts
│   │   ├── components/# Reusable UI components
│   │   ├── contexts/  # React contexts (Auth)
│   │   ├── lib/       # API clients and utilities
│   │   └── types/     # TypeScript type definitions
│   └── public/        # Static assets
│
├── backend/           # Spring Boot 3.5 (Java 17, MongoDB)
│   └── src/main/java/com/universe/backend/
│       ├── config/    # Security, validation configs
│       ├── controller/# REST API endpoints
│       ├── dto/       # Data transfer objects
│       ├── model/     # MongoDB document models
│       ├── repository/# Spring Data repositories
│       └── service/   # Business logic layer
│
└── docs/              # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **MongoDB** (local or cloud instance like MongoDB Atlas)

### Backend Setup

1. **Configure MongoDB**
   
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/universe
   ```

2. **Run the backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   
   The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open `http://localhost:3000` in your browser.

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/initiate` | Start signup with OTP |
| POST | `/api/auth/signup/verify` | Verify OTP and create account |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/password/forgot` | Request password reset OTP |
| POST | `/api/auth/password/reset` | Reset password with OTP |

### Connect Space
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/space/connect/posts` | List all posts |
| POST | `/api/space/connect/posts` | Create a new post |
| DELETE | `/api/space/connect/posts/{id}` | Delete a post |

### Pro-Space
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/space/pro/opportunities` | List opportunities |
| POST | `/api/space/pro/opportunities` | Create opportunity |
| POST | `/api/space/pro/opportunities/{id}/apply` | Apply to opportunity |
| GET | `/api/space/pro/rooms` | List project rooms |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/space/events` | List approved events |
| POST | `/api/space/events` | Submit event for review |

### Direct Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/space/dm/conversations` | List conversations |
| POST | `/api/space/dm/conversations` | Start new conversation |
| GET | `/api/space/dm/conversations/{id}/messages` | Get messages |
| POST | `/api/space/dm/conversations/{id}/messages` | Send message |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/events/pending` | List pending events |
| POST | `/api/admin/events/{id}/approve` | Approve event |
| POST | `/api/admin/events/{id}/reject` | Reject event |

## 🎯 Key Technical Features

- **University Domain Mapping**: Automatic lookup of full university names from email domains (100+ US universities supported)
- **Image Support**: Base64 image encoding for Connect posts
- **Real-time Messaging**: Polling-based message updates
- **Responsive Design**: CSS Grid and Flexbox layouts
- **Form Validation**: Jakarta Bean Validation on backend, client-side validation on frontend
- **Error Handling**: Global exception handling with user-friendly messages

## 🔒 Security Features

- BCrypt password hashing
- JWT token-based authentication
- CORS configuration for frontend origin
- Role-based endpoint protection
- University space isolation

## 📱 Screenshots

The application features a unique solar system navigation where each planet represents a different space:

- **Sun (Center)**: Your university name
- **Planets**: Connect, Pro, Events, DM spaces
- **Interactive**: Drag to rotate, click to enter

## 🛠️ Tech Stack

### Frontend
- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS
- CSS Modules

### Backend
- Spring Boot 3.5
- Spring Security
- Spring Data MongoDB
- Java 17
- Maven

### Database
- MongoDB

## 📄 License

Private repository - All rights reserved.

## 👩‍💻 Author

**Vennela** - [GitHub](https://github.com/vennela0743)

---

*Built with ❤️ for university students everywhere*
