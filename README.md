# UniVerse

**UniVerse – From Conversations to Collaborations**

Campus-only social platform for students to connect, collaborate, and grow. Different **Spaces** (Connect, Pro-Space, Group Spaces, Mystery Chat, DM, Discover, Event) are represented as an interactive solar-system landing experience.

## Repo structure

- **frontend/** – Next.js 16 (React 19, TypeScript, Tailwind CSS)
- **backend/** – Spring Boot 3.5 (Java 17, MongoDB, Spring Security)

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

Requires Java 17+ and MongoDB. Configure `spring.data.mongodb.uri` in `backend/src/main/resources/application.properties`, then:

```bash
cd backend
./mvnw spring-boot:run
```

## License

Private – vennela0743/universe-web
