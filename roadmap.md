# Movie App Roadmap

This project is a self-hostable, open source movie & TV media manager powered by TMDB.
The goal is simple: track, discover, and organize what you watch without giving up control of your data.

---

## Phase 1: Core Features (Completed)

### Discovery

- [x] API integration with TMDB
  - [x] Trending content
  - [x] Popular content
  - [x] Upcoming content
  - [x] Movie & TV details
- [x] Search movies and TV shows
- [x] Filter by type (movie / TV / both)
- [x] Homepage with responsive grids and carousels

### Details Page

- [x] Title, description, cast, metadata
- [x] User actions (watchlist, liked, watched)
- [ ] Platform availability (JustWatch integration)
- [ ] Updated details page.

---

## Phase 2: User Library (Completed)

### Tracking

- [x] Mark as watched
- [x] Watchlist management
- [x] Like / favorite items
- [x] Persist user activity in database

### Organization

- [x] Separate movies and TV shows
- [ ] Custom collections (themed lists, mood lists, etc.)

---

## Phase 3: Social & Privacy (In Progress)

### Social

- [ ] Friends system
- [ ] View friends’ activity and recommendations
- [ ] Share collections with public links

### Privacy

- [ ] Per-list privacy (public / friends / private)
- [ ] Private profiles
- [ ] Full ghost mode (no public footprint)

---

## Phase 4: Data Ownership & Hosting

- [ ] Self-hosting support (Docker-first)
- [ ] Environment-based configuration
- [ ] Import data (JSON)
- [ ] Export all user data
- [ ] Zero vendor lock-in guarantee

---

## Phase 5: Recommendations

### Basic

- [ ] Genre-based recommendations using TMDB
- [ ] Similar-content suggestions

### Advanced (Optional)

- [ ] AI-powered recommendations
- [ ] Bring-your-own API key or local AI
- [ ] No server-side data training

---

## Phase 6: Insights & Stats

- [ ] Watch history statistics
- [ ] Time spent watching
- [ ] Genre breakdowns
- [ ] Viewing trends over time

---

## Phase 7: UI Experiments (Optional)

- [ ] Swipe-based discovery (Tinder-like)
- [ ] Framer Motion animations
- [ ] Feedback-driven recommendation tuning

---

## Phase 8: Sustainability

- [ ] Optional paid subscription for hosted users
- [ ] Self-hosting remains free
- [ ] No features locked behind payment

---

## Guiding Principles

- User owns their data
- Self-hosting is first-class
- Privacy is opt-in, not an afterthought
- Social features are optional
- No dark patterns
- No algorithm manipulation
