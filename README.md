# 🧠 Ace Chatbot

A modern conversational AI web application built with **Next.js 14**, **TypeScript**, and **OpenAI’s Chat API**.  
Ace Chatbot provides a dynamic, real-time chat interface designed for both experimentation and integration into broader applications.

---

## 🚀 Overview

Ace Chatbot is designed to serve as a full-stack example of a chatbot system built using **Next.js App Router**.  
It includes:

- Real-time conversation through an OpenAI API route.
- Authentication via sign-in / sign-up pages.
- A modular front-end with reusable React components.
- Built-in theming and global styling.
- Middleware for route protection and request handling.

---

## 🏗️ Architecture

Ace Chatbot uses the **Next.js App Router** (under `src/app`) and a few legacy **Pages Router** features (under `src/pages`) for flexibility.

```
src/
├── app/                     # App Router (core of the project)
│   ├── api/                 # Server-side routes for OpenAI API
│   ├── chat/                # Main chat UI
│   ├── sign-in/             # Authentication: Sign-in route
│   ├── sign-up/             # Authentication: Sign-up route
│   └── layout.tsx           # Root layout (applies to all pages)
│
├── pages/                   # Legacy Pages Router (static pages & examples)
│   ├── api/hello.ts         # Example Next.js API route
│   ├── _document.tsx        # Custom HTML structure
│   └── index.tsx            # Default landing page
│
├── styles/                  # Global and module-based styles
│   ├── globals.css
│   └── Home.module.css
│
├── middleware.ts            # Middleware for routing / authentication
└── package.json             # Dependencies and scripts
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | CSS Modules, Global CSS |
| **Backend** | Next.js API Routes, Node.js Runtime |
| **AI Integration** | OpenAI Chat API |
| **Auth** | NextAuth.js or custom authentication (sign-in / sign-up) |
| **Deployment** | Vercel (recommended) |

---

## 🧩 Key Modules

### 🗨️ `/app/chat`
Implements the chat interface.  
- Displays user and assistant messages.  
- Handles streaming or async requests to `/api/chat/route.js`.  
- Uses modular CSS (`chat.module.css`) for isolated design.

### 🔐 `/app/sign-in` and `/app/sign-up`
Handles authentication and session flow.  
- Sign-in and sign-up are implemented in isolated routes for simplicity.  
- Styling handled via their own CSS modules.  
- Easily replaceable with a third-party auth system like **NextAuth** or **Firebase Auth**.

### ⚙️ `/app/api/chat/route.js`
Handles POST requests from the chat UI.  
- Communicates with the OpenAI API to send user prompts.  
- Returns the assistant’s reply in JSON (or as a stream).  
- This is the **core backend logic** for Ace Chatbot.

### 🧠 `/middleware.ts`
Can be used for:
- Route protection (redirect unauthenticated users).
- Logging / analytics.
- API request filtering.

---

## 🧱 Pages Directory (Legacy Routes)

- `src/pages/api/hello.ts` → Simple demo API route.
- `src/pages/_document.tsx` → Custom HTML document layout.
- `src/pages/index.tsx` → Default “Create Next App” landing page (safe to replace).

---

## 🎨 Styling

- `globals.css` defines **global variables**, base colors, typography, and dark/light theme support.
- `Home.module.css` contains **component-level styles** for the index page.
- CSS Modules are used in `/app/...` for **scoped styling**.

> 💡 Tip: If you plan to expand the UI, consider integrating **Tailwind CSS** or **Chakra UI** for a faster workflow.

---

## 🧰 Environment Variables

Before running the project, create a `.env.local` file at the root:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

## 🏃‍♂️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ace-chatbot.git
cd ace-chatbot
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Run the development server
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
npm run start
```

---

## 🧪 Testing

Ace Chatbot currently does not include unit tests, but it’s compatible with:
- **Jest** for logic testing
- **React Testing Library** for component behavior

---

## 🚀 Deployment

The easiest deployment path is **Vercel**:
1. Push your project to GitHub.
2. Go to [vercel.com](https://vercel.com).
3. Import the repository.
4. Set environment variables under “Project Settings”.
5. Deploy!

Vercel automatically builds and deploys Next.js projects.

---

## 🛠️ Future Enhancements

- [ ] Add persistent chat history (via Supabase or MongoDB).
- [ ] Implement user session management with NextAuth.
- [ ] Support multiple AI models and custom parameters.
- [ ] Add streaming response handling for real-time typing.
- [ ] Improve accessibility and mobile responsiveness.

---

## 📄 License
This project is distributed under the **MIT License**.  
You’re free to use, modify, and distribute it for personal or commercial projects.

---

## 💬 Contributing
Pull requests are welcome!  
If you’d like to contribute, fork the repository and submit a PR with clear commit messages.

---

## 🧑‍💻 Maintainer
**Ace Chatbot Team**  
Built with ❤️ using Next.js and OpenAI.

---

