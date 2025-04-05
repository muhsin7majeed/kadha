# 🎬 Movie App Roadmap

## 📦 **Phase 1: Core Features & Setup**

- [ ] **API Integration**: Build endpoints for:
  - [x] Trending movies
  - [ ] Popular movies
  - [ ] Upcoming movies
  - [ ] Movie details
- [ ] **Homepage**: Display movies using responsive carousels or grids.
- [ ] **Movie Details Page**:
  - [ ] Show title, cast, description, platform availability, and user actions.

---

## ✅ **Phase 2: User Actions**

- [ ] **Watched Movies**:
  - [ ] API to mark movies as watched.
  - [ ] API to get watched movies.
- [ ] **Watchlist**:
  - [ ] Add/remove movies from a watchlist.
- [ ] **Likes & Dislikes**:
  - [ ] Implement APIs to like/dislike movies.
  - [ ] Track likes/dislikes in the database.
- [ ] **Movie Platforms**:
  - [ ] Integrate with **JustWatch API** to show platform availability.
  - [ ] Display platform badges.

---

## 📁 **Phase 3: Collections**

- [ ] **Create & Manage Collections**:
  - [ ] API to create collections with name, description, and movies.
  - [ ] API to add/remove movies from collections.
- [ ] **Sharing Collections**:
  - [ ] Generate a **UUID** for public, shareable links (e.g., `/collection/:uuid`).
  - [ ] Add a copy-to-clipboard button for easy sharing.

---

## 💡 **Phase 4: Recommendations**

- [ ] **Basic Recommendation**:
  - [ ] Suggest movies based on similar genres using TMDB's API.
- [ ] **Advanced Recommendation (Future)**:
  - [ ] Implement collaborative filtering using libraries like **Surprise** or **Scikit-learn**.
  - [ ] Train using a matrix of user preferences.

---

## 💕 **Phase 5: Tinder-like Swiping Feature**

- [ ] **UI & Animation**:
  - [ ] Build swipe UI using **Framer Motion**.
- [ ] **Algorithm**:
  - [ ] Recommend movies based on previous likes and dislikes.
- [ ] **Feedback Loop**:
  - [ ] Adjust recommendations based on swipe data.

---

## 🚀 **Additional Features (Future Ideas)**

- [ ] **Movie Reviews & Comments**: Allow users to write reviews and rate movies.
- [ ] **Friends & Social Features**: Users can follow others and view their collections.
- [ ] **Notifications**: Notify users when a movie becomes available on a streaming platform.
- [ ] **Dark Mode**: Provide a clean dark mode UI.
