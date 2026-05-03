# Kenneth Jehezkiel Marvel Wijaya · Portfolio

> *"Building software that matters — one line of code at a time."*

A personal portfolio website built from scratch with React, Vite, and Tailwind CSS — showcasing my projects, skills, certifications, and journey as a student developer.

🌐 **Live Site:** [elitcxportfolio.vercel.app](https://elitcxportfolio.vercel.app)

---

## 👤 About Me

I'm a **student at SMA Regina Pacis Surakarta**, passionate about **Software Engineering and Development**. I love turning ideas into real, working applications and exploring how code can solve everyday problems — whether that's crafting clean frontends, writing automation scripts, or competing in national programming competitions.

- 🚀 Aspiring Developer
- 💡 Problem Solver
- 🏆 Competitive Programmer with **10+ national competition wins**
- 📚 5+ years of programming experience

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite](https://vite.dev/) (via rolldown-vite) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Font | [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) |
| Deployment | [Vercel](https://vercel.com/) |
| Language | JavaScript (87%) + CSS (12%) |

---

## 💻 Skills

| Language / Tool | Level |
|---|---|
| C++ | 🔴 Competition Level · Algorithms / Competitive Programming |
| Python | 🔴 Competition Level · Automation / Scripts |
| JavaScript | 🟡 Intermediate · Frontend / Web |
| ReactJS | 🟡 Intermediate · Components / SPA |
| SQL | 🟢 Beginner · CRUD Queries |

---

## 📂 Projects

| Project | Description | Tech |
|---|---|---|
| [One Choice Endless Paths](https://onechoiceep.vercel.app) | An interactive narrative where a single act of kindness branches into many paths | React, JS, HTML, CSS |
| [Push Up & Pull Up Challenge App](https://elitcxchallenge.vercel.app) | Year-long fitness challenge tracker for daily push-ups and weekly pull-ups | React, JS, HTML, CSS |
| [Tokopedia Webscraper](https://github.com/elitcx/Tokopedia-Webscraper) | Automated scraper that searches items and exports results to a spreadsheet | Python, Selenium, BeautifulSoup, Pandas |
| [Simple Chatbot](https://github.com/elitcx/Simple-Chatbot) | A chatbot using a probability-based response system | Python |
| [Finance Tracker](https://github.com/elitcx/Finance-Tracker) | Console-based finance logger with input, edit, delete, and balance tracking | Python |
| [To Do List](https://elitcx.github.io/) | Task manager with date filtering, status tracking, and task search | HTML, CSS, JavaScript |
| [Traffic Maze Solver](https://github.com/elitcx/Traffic-Maze-Solver) | Dijkstra's algorithm on a 2D grid to find the least-dense traffic route | C++, DSA |

---

## 🏆 Certifications & Awards

- 🥈 **2nd Place** — Battle of Technology PingFEST UNS 2025
- 🥈 **2nd Place** — Competitive Programming IAA UKDW Yogyakarta 2025
- 🥈 **2nd Place** — Logicodix Programming & Coding Competition UNESA 2025
- 🥉 **3rd Place** — Informatics Rally Games and Logic (IRGL) PCU 2025
- 🎖️ **Finalist** — OSN Informatika Surakarta 2025
- 🥈 **Semifinalist** — ILPC Ubaya 2026
- 🥈 **Silver Medal** — Final OMNAS 13 Matematika 2024
- 🥈 **Silver Medal** — Final OMNAS 13 English 2024
- 🥈 **2nd Place** — National Junior Highschool Math Competition – Practo Math Academy 2024
- 🏅 **Top 10** — Entrepreneurship Business Challenge & Competition 6.0 UKWMS 2024
- ✅ **Completed** — Intro to Software Engineering – RevoU 2025
- ✅ **Completed** — Cybersecurity Workshop: "Breaking the Code" – PSB Academy 2025
- 🧑‍🏫 **Mentor** — Tutor Sebaya 2024–2025
- 👥 **Member** — Ursulin Investment Club 2024–2025

---

## 📬 Contact

| Platform | Link |
|---|---|
| 📸 Instagram | [@kenneth_kiel](https://www.instagram.com/kenneth_kiel/) |
| 💬 WhatsApp | [+62 822-6159-2211](https://wa.me/6282261592211) |
| 🐙 GitHub | [github.com/elitcx](https://github.com/elitcx) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/elitcx/portfolio.git
cd portfolio

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
portfolio/
├── public/
│   └── images/               # Project images, icons, certificates
├── src/
│   ├── assets/
│   │   └── projects.json     # Project data
│   ├── components/
│   │   ├── Hero.jsx          # Landing hero with typewriter effect
│   │   ├── Homepage.jsx      # About, Stats, Skills, Certifications
│   │   ├── Portfoliopage.jsx # Filterable project grid
│   │   ├── Contactpage.jsx   # Contact links
│   │   ├── NavigationBar.jsx # Fixed floating navbar
│   │   ├── Footer.jsx        # Footer
│   │   └── ...               # ThemeSlider, ImageZoom, Button
│   ├── hooks/
│   │   └── UseTypewriter.js  # Custom typewriter hook
│   ├── utils/
│   │   ├── Constants.js      # Skills, stats, projects, contact data
│   │   └── Animations.js     # Shared Framer Motion variants
│   ├── App.jsx               # Root component & page router
│   └── main.jsx              # Entry point
├── index.html
├── tailwind.config.cjs
├── vite.config.js
└── package.json
```

---

## ✨ Features

- **Dark / Light mode** with system preference detection and localStorage persistence
- **Typewriter hero animation** on the landing section
- **Animated skill bars** with proficiency levels (Competition / Intermediate / Beginner)
- **Filterable project grid** with search and category filters
- **Zoomable certificate gallery** with lazy-loaded images
- **Smooth page transitions** powered by Framer Motion
- **Floating glassmorphism navbar** with scroll-aware styling
- **Fully responsive** across mobile and desktop

---

## 🌐 Deployment

Deployed automatically on [Vercel](https://vercel.com/). Every push to `main` triggers a new deployment. No additional configuration required — just import the repo and set the framework preset to **Vite**.

---

*Made with 💙 by [Kenneth Jehezkiel Marvel Wijaya](https://github.com/elitcx)*
