# University Space Foundation – Design Only

**Phase:** Conceptual design. No backend code, no database schemas, no auth changes.

---

## 1. What a University Space Represents

A **University Space** is the core container for all campus-scoped activity in UniVerse.

| Aspect | Definition |
|--------|-------------|
| **Identity** | One Space per university, identified by email domain (e.g. `stanford.edu` → one Space). |
| **Scope** | All content, features, and membership are scoped to that Space. Users in Space A never see Space B’s content in MVP. |
| **Role in system** | The tenant boundary: every feature (Connect, Discover, Events, DM, etc.) is “inside” a University Space. |
| **User relationship** | Each user is assigned to exactly one Space at signup (derived from email domain) and does not switch in MVP. |

So: **University Space** = the university’s instance of UniVerse; it’s the “room” where that campus’s users and content live.

---

## 2. Conceptual Page Map (Routes & Screens)

### 2.1 Global (not tied to a Space)

These exist before or outside the user’s University Space. No Space context required.

| Route | Screen | Who sees it |
|-------|--------|-------------|
| `/` | **Landing** | Everyone (anonymous + logged-in). Solar system, branding, Login / Profile. |
| `/login` | **Login** | Anonymous. |
| `/signup` | **Signup** | Anonymous. |
| *(optional)* `/about` | About / product info | Everyone. |

**Note:** After login, we have a choice: keep landing at `/` as the “world view” or redirect authenticated users into their Space. See routing below.

### 2.2 University-Scoped (inside the user’s Space)

All of these are **within** the user’s University Space. The app always knows “current user + their Space” (from auth + Space derived at signup).

| Route | Screen | Purpose |
|-------|--------|--------|
| `/space` or `/home` | **Space Home** | Entry into the user’s university. Hub for navigating Spaces (Connect, Discover, etc.). Can reuse or adapt solar-system metaphor. |
| `/space/connect` | **Connect** | First real feature: feed / conversations for “Connect Space” inside this university. |
| `/space/discover` | Discover | Placeholder for later. |
| `/space/events` | Events | Placeholder for later. |
| `/space/dm` | DM | Placeholder for later. |
| *(future)* | Pro-Space, Group Spaces, Mystery Chat, etc. | Same pattern: `/space/<feature>`. |

**Naming choice:** Use **`/space`** as the prefix for “inside my university” so the URL makes tenant scope explicit (e.g. `/space`, `/space/connect`). Alternatives: `/home`, `/campus` — same idea.

### 2.3 Profile

| Route | Screen | Scope |
|-------|--------|--------|
| `/profile` | Profile | Global (user-level). Shows user info; can later show “Member of [University Name]” without switching Space. |

### 2.4 Page Map Summary

```
/                    → Landing (global)
/login               → Login (global)
/signup              → Signup (global)
/profile             → Profile (global, user-level)

/space               → Space Home (university-scoped)
/space/connect       → Connect (university-scoped)
/space/discover      → Discover (placeholder)
/space/events        → Events (placeholder)
/space/dm            → DM (placeholder)
```

**Clear separation:**  
- **Global:** `/`, `/login`, `/signup`, `/profile` — no Space in context.  
- **University-scoped:** `/space` and everything under `/space/*` — always in the context of the user’s single University Space.

---

## 3. Post-Login Routing & Page Hierarchy

### 3.1 Decision: Where does the user land after login/signup?

**Recommended:** After login or signup, redirect to **Space Home** (`/space` or `/home`).  
- Rationale: They came to use their campus; landing at `/` again is less useful.  
- Flow: Signup/Login success → redirect to `/space` (or `/home`).

**Alternative:** Redirect to `/` and show a different experience for authenticated users (e.g. solar system that links into Space). Either way, the *canonical* “I’m inside my university” entry is one dedicated route (`/space`).

### 3.2 Hierarchy

- **Tier 0 – Global:** Landing, Login, Signup, Profile. No Space.
- **Tier 1 – Space entry:** Space Home. Requires auth; resolves “my Space” once (from user’s stored Space or email domain).
- **Tier 2 – Space features:** Connect, Discover, Events, DM, etc. All under `/space/*`. Each is a child of Space Home in the information hierarchy.

Navigation: From Space Home, user can go to Connect, Discover, etc. Bottom taskbar (or equivalent) reflects this: Home (= Space Home), Spaces (maybe list of features), Discover, Alerts — all within the same Space.

### 3.3 Access rules (conceptual)

- **Anonymous:** Can access `/`, `/login`, `/signup`. Any attempt to hit `/space` or `/space/*` → redirect to login (or landing with “Log in to enter your Space”).
- **Authenticated:** Can access `/`, `/profile`, `/space`, `/space/*`. Optional: visiting `/` while logged in could auto-redirect to `/space` or show a “Go to my Space” CTA.

---

## 4. Solar-System UI After Login

Today the landing page has a solar system: sun = UniVerse, planets = Spaces (Connect, Pro-Space, etc.). That’s a **global metaphor** (all possible Spaces).

After login, the same metaphor can be **reused in a university-scoped way**:

| Option | Description |
|--------|-------------|
| **A – Same visual, new meaning** | On Space Home (`/space`), show the same solar system but it now represents **this university’s** Spaces. Sun = “Your University” or “UniVerse – [University Name]”; planets = Connect, Discover, Events, DM, etc. **within this campus.** Clicking a planet goes to `/space/connect`, `/space/discover`, etc. |
| **B – Different Space Home UI** | Space Home is a different layout (e.g. dashboard, list of Spaces, or a feed). Solar system remains only on landing for marketing. |
| **C – Hybrid** | Landing keeps solar system for anonymous; after login, Space Home can be a simplified “orbit” or list that links to Connect, Discover, etc., reusing the same mental model without the full animation. |

**Recommendation:** **Option A** — Reuse the solar system on Space Home so the metaphor is consistent: “these planets are your campus’s Spaces.” Same interaction (click planet → go to that feature). No cross-university content; it’s clearly “my university’s Connect,” “my university’s Discover,” etc.

**Global vs Space:**  
- **Landing (`/`):** Solar system = global product (UniVerse + all feature types). Can stay as-is; “Login” / “Profile” in header.  
- **Space Home (`/space`):** Solar system = this university’s Spaces only. Header can show university name or “UniVerse – [University]”; taskbar navigates within Space.

---

## 5. First Space Feature: Connect

### 5.1 Purpose

**Connect** is the “talk, share, and express freely” Space — a campus-scoped social feed or conversation surface. First real feature inside a University Space.

### 5.2 UX (high level)

- **Entry:** From Space Home, user clicks Connect planet (or “Connect” in nav) → `/space/connect`.
- **Screen:** A feed or stream of content (posts, threads — exact format TBD). All content is from and for the same University Space.
- **Actions (conceptual):** Create post/reply, view thread, maybe like or react. No implementation detail here.
- **Scope:** Only members of this university see this content; no mixing with other universities.

### 5.3 User flows

**Flow 1 – Signup → Space Home → Connect**

1. User signs up with `alice@stanford.edu`, password, display name.
2. Auth creates user; system derives Space from domain (e.g. `stanford.edu` → University Space “Stanford”).
3. Redirect to Space Home (`/space`).
4. User sees solar system for Stanford’s Spaces; clicks Connect.
5. User lands on `/space/connect`, sees (empty or existing) feed for Stanford’s Connect.

**Flow 2 – Login → Space Home → Connect**

1. User logs in with existing credentials.
2. Redirect to Space Home (`/space`).
3. Same as above: click Connect → `/space/connect`.

**Flow 3 – Direct link while logged in**

1. User is logged in, visits `/space/connect` (bookmark or shared link).
2. App resolves user’s Space from auth; ensures content is for that Space only.
3. Show Connect feed for that Space.

**Flow 4 – Not logged in**

1. User visits `/space` or `/space/connect`.
2. Redirect to `/login` (or `/` with prompt to log in).

### 5.4 Data shape (high level – names and responsibilities only)

These are **conceptual** data objects. No fields, no schema.

| Object | Responsibility |
|--------|-------------------------------|
| **University Space** | Represents one university’s tenant. Identified by domain (or stable ID). Attributes could include display name, domain, etc. |
| **User** (existing) | Identity from auth. Has a link to exactly one University Space (set at signup). |
| **Connect Post** (or equivalent) | A single piece of content in Connect (e.g. a post or thread root). Belongs to a University Space and an author (User). |
| **Connect Thread / Reply** (optional) | If Connect is threaded: replies or comments tied to a Connect Post, same Space, same author concept. |

All of these are placeholders for later implementation. Rules:  
- Anything “in Connect” is tied to a University Space and to a User.  
- Resolving “which Space” always goes through the user (user → their Space).

---

## 6. Global vs University-Scoped Views (Summary)

| View type | Routes | Context | Solar system (conceptual) |
|-----------|--------|---------|----------------------------|
| **Global** | `/`, `/login`, `/signup`, `/profile` | No Space; optional “current user” | On `/`: product-level (UniVerse + all feature types). |
| **University-scoped** | `/space`, `/space/connect`, `/space/*` | User + their single University Space | On `/space`: this university’s Spaces (Connect, Discover, etc.). |

- **Global:** Branding, auth, profile; no tenant.  
- **University-scoped:** All features and content live here; tenant = one University Space per user.

---

## 7. High-Level Data Objects (Names & Responsibilities Only)

No fields or schemas — only roles in the system.

| Object | Responsibility |
|--------|-------------------------------|
| **University Space** | The tenant container. One per university (per domain). Holds identity of the campus; all Space-scoped data references it. |
| **User** | Identity (auth). Belongs to exactly one University Space. Used for authorship and membership. |
| **Connect Post** | A single Connect item (post/thread root) in a University Space. Has an author (User). |
| **Connect Reply** (or **Connect Comment**) | Optional. A reply/comment under a Connect Post; same Space, has author. |

Future features will introduce more objects (e.g. Event, DM Conversation, Group) — all tied to University Space and User in the same way.

---

## 8. Design Summary

| Topic | Decision / Definition |
|-------|------------------------|
| **University Space** | One per university (per domain); core container; all features scoped to it. |
| **Post-login** | Redirect to Space Home (`/space`). |
| **Page hierarchy** | Global: `/`, `/login`, `/signup`, `/profile`. Space: `/space` (home), `/space/connect`, `/space/discover`, etc. |
| **Solar system after login** | Reuse on Space Home for *this university’s* Spaces; clicking a planet → `/space/connect`, etc. |
| **Connect** | First feature; feed/conversation in a Space; flows from Space Home; data objects: University Space, User, Connect Post, (optional) Connect Reply. |
| **Separation** | Global = no Space. University-scoped = `/space` and children; one Space per user. |

No code, no DB, no auth changes — design only. Ready for implementation when you decide to build.
