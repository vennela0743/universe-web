# UniVerse – Project Status & Design Direction

**Last updated:** Concept phase. No backend or database implementation for University Space yet.

---

## 1. Authentication – FROZEN

Authentication is **complete and frozen**. Treat it as a black box.

### Do NOT (unless explicitly asked)

- Change authentication logic, JWT handling, password flow, or security configuration.
- Add new auth features: OTP, magic links, refresh tokens, SSO, roles, admin approval.
- Refactor or “improve” existing auth code.

### What auth provides

- **Authenticated user** (identity)
- **Email**
- **userId**
- **JWT token**

All future work assumes these are available and stable.

---

## 2. Product Direction – University-Scoped, Multi-Tenant

UniVerse is a **university-scoped, multi-tenant platform**.

| Concept | Rule |
|--------|------|
| **University Space** | The core container. One per university (per email domain). |
| **Email domain → Space** | Each email domain maps to **exactly one** University Space. |
| **User → Space** | Each user belongs to **exactly one** University Space, determined at signup. |
| **MVP** | Users **never switch spaces** in MVP. |
| **All features** | Connect, Discover, Events, DM, Pro-Space, Group Spaces, Mystery Chat, etc. are **scoped to the user’s University Space**. |

So: one university = one Space; one user = one Space for life in MVP; all content and features live inside that Space.

---

## 3. Current Focus (No Code Yet)

- **No** backend or database changes for University Space yet.
- Work is **conceptual only**: design, documentation, routing decisions, UX flow planning.
- **Goal:** Prepare for introducing **University Space** as the core container.

---

## 4. Next Goal (When Asked)

When you’re ready to implement:

1. **Design the University Space foundation** – how it’s represented, how it’s created/resolved from email domain, how it’s attached to the user and to all future resources.
2. **Design the first real feature: Connect** – scoped inside a University Space (concept, flows, routing, UX; implementation only when you ask for it).

---

## 5. Summary

| Area | Status |
|------|--------|
| Auth | Frozen; black box (user, email, userId, JWT). |
| University Space | Concept only; not yet in backend/DB. |
| Multi-tenancy | One domain → one Space; one user → one Space (set at signup). |
| Features (Connect, etc.) | To be scoped to University Space; design when requested. |

Auth stays untouched. Next step is designing the University Space foundation and Connect, on request.
