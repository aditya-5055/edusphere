# EduSphere 🎓

> A full-stack online learning marketplace where instructors can create & sell courses and students can browse, enroll, and learn — built with the MERN stack.

## ✨ Features

### 👨‍🎓 Student
- Browse and search courses by category, rating, and price
- Enroll in courses via secure Razorpay payment gateway
- Track course progress with a dedicated dashboard
- Watch video lectures and access course materials
- Leave reviews and ratings on completed courses

### 👨‍🏫 Instructor
- Create, edit, and publish courses with rich content
- Upload video lectures and thumbnails via Cloudinary
- View enrolled students and earnings dashboard
- Manage course sections and sub-sections

### 🔐 Auth & General
- JWT-based authentication with protected routes
- Role-based access control (Student / Instructor / Admin)
- OTP email verification on signup via Nodemailer
- Fully responsive design for all screen sizes

---

## 🚀 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React.js, Vite, TailwindCSS         |
| State Mgmt   | Redux Toolkit (slices + reducers)   |
| Backend      | Node.js, Express.js                 |
| Database     | MongoDB Atlas, Mongoose             |
| Auth         | JWT, bcrypt                         |
| Media Upload | Cloudinary                          |
| Payment      | Razorpay                            |
| Email        | Nodemailer + Gmail SMTP             |

---

## 📁 Project Structure

```
EduSphere/
├── client/                     # React + Vite + TailwindCSS
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, icons, static files
│   │   ├── components/         # Reusable UI components
│   │   ├── data/               # Static/mock data
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page-level components
│   │   ├── reducer/            # Redux reducers
│   │   ├── services/           # API call functions
│   │   ├── slices/             # Redux Toolkit slices
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express REST API
│   ├── config/                 # DB connection, Cloudinary setup
│   ├── controllers/            # Route handler logic
│   ├── mail/                   # Email templates
│   ├── middleware/             # Auth, error handling middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── utils/                  # Utility/helper functions
│   ├── .env.example
│   └── index.js                # Server entry point
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account — [cloud.mongodb.com](https://cloud.mongodb.com)
- Cloudinary account — [cloudinary.com](https://cloudinary.com)
- Razorpay account — [razorpay.com](https://razorpay.com)
- Gmail App Password — [myaccount.google.com](https://myaccount.google.com/apppasswords)

---

### 1. Clone the repository

# Clone repo
git clone https://github.com/aditya-5055/edusphere.git

# Backend setup
cd edusphere/server
npm install
npm run dev

# Frontend setup (new terminal)
cd edusphere/client
npm install
npm start

---

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file inside `/server` using the example:

```bash
cp .env.example .env
```

Fill in your values in `/server/.env`:

```env
PORT=4000
MONGODB_URL=your_mongodb_atlas_connection_string

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password

JWT_SECRET=your_strong_jwt_secret

FOLDER_NAME=EduSphere

RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

Start the server:

```bash
npm run dev
```

> Server runs on `http://localhost:4000`

---

### 3. Setup the Client

```bash
cd ../client
npm install
```

Create a `.env` file inside `/client`:

```bash
cp .env.example .env
```

Fill in your values in `/client/.env`:

```env
VITE_BASE_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

Start the client:

```bash
npm run dev
```

> Client runs on `http://localhost:5173`

---

## 🌐 Environment Variables Reference

### `/server/.env.example`

```env
PORT=4000
MONGODB_URL=your_mongodb_atlas_connection_string
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
JWT_SECRET=your_jwt_secret_key
FOLDER_NAME=EduSphere
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### `/client/.env.example`

```env
VITE_BASE_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

---

## 🔐 Security Notes

- Never commit `.env` files — they are listed in `.gitignore`
- Always use `.env.example` files with placeholder values for reference
- Rotate your secrets immediately if accidentally exposed

---

## 🌿 Git Workflow

```bash
# Create a feature branch
git checkout -b feat/your-feature-name

# Stage and commit
git add .
git commit -m "feat: describe your change"

# Push branch
git push origin feat/your-feature-name

# Open a Pull Request on GitHub to merge into main
```

### Commit Message Convention

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Formatting only |
| `refactor:` | Code restructure |
| `chore:` | Config or dependency update |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by the EduSphere Team