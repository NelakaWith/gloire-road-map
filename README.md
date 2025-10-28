# 🎯 Gloire Road Map

> A comprehensive goal tracking and student management platform with real-time analytics and attendance management.

[![CI/CD](https://github.com/NelakaWith/gloire-road-map/actions/workflows/deploy.yml/badge.svg)](https://github.com/NelakaWith/gloire-road-map/actions)
![Vue 3](https://img.shields.io/badge/Vue.js-3.4-green)
![Node.js](https://img.shields.io/badge/Node.js-Express-blue)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)

## 📋 Project Overview

Gloire Road Map is a modern full-stack application designed for educational institutions and training programs to track student goals, manage attendance, and analyze performance metrics. The platform provides separate interfaces for administrators and students, featuring real-time analytics, session-based attendance marking, and comprehensive goal management.

## 🚀 Tech Stack

### Frontend

- **Vue 3** with Composition API
- **PrimeVue** component library with custom themes
- **Vite** for build tooling and HMR
- **Pinia** for state management
- **Vue Router** for SPA navigation
- **Chart.js & Vue-ChartJS** for data visualization
- **Tailwind CSS** for styling
- **Vitest** for testing

### Backend

- **Node.js** with Express framework
- **Sequelize ORM** with MySQL database
- **JWT** authentication with bcrypt
- **Swagger** for API documentation
- **Express Rate Limiting** for security
- **Vitest** for unit testing

### DevOps & Tools

- **GitHub Actions** CI/CD pipeline
- **Semantic Release** for versioning
- **Husky** pre-commit hooks
- **Commitizen** for conventional commits
- **PM2** for production process management

## ✨ Key Features

### 🎯 Goal Management

- Create, edit, and track student goals with deadlines
- Bulk operations and advanced filtering
- Progress tracking with visual indicators
- Goal completion analytics

### 📊 Advanced Analytics

- **Throughput Analysis**: Goal creation vs completion rates
- **Time-to-Complete**: Statistical analysis with P90 metrics
- **Backlog Management**: Age buckets and overdue tracking
- **Visual Charts**: Interactive time-series and histogram displays

### 👨‍🎓 Attendance System

- Session-based attendance marking with visual student grids
- Bulk attendance operations (mark all present/absent)
- Date-based attendance sheets
- Real-time attendance status updates

### 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control (Admin/Student)
- Rate limiting and input validation
- Secure session management

### 📱 Modern UI/UX

- Responsive design for all devices
- Dark/light theme support
- Interactive data tables with sorting and filtering
- Modal dialogs for seamless workflows

## 📁 Project Structure

```
gloire-road-map/
├── frontend/                 # Vue 3 SPA
│   ├── src/
│   │   ├── components/       # Reusable Vue components
│   │   ├── views/           # Page-level components
│   │   ├── stores/          # Pinia state management
│   │   ├── router/          # Vue Router configuration
│   │   └── assets/          # Static assets
│   └── test/                # Frontend test suites
├── backend/                 # Express.js API
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic layer
│   ├── models.js            # Sequelize models
│   ├── middleware/          # Custom middleware
│   └── test/               # Backend test suites
├── _db/                    # Database scripts and seeds
├── .github/workflows/      # CI/CD pipeline
└── scripts/               # Deployment and utility scripts
```

## 🔑 Key Concepts

### Analytics Engine

The platform includes a sophisticated analytics engine that processes goal and attendance data to provide actionable insights:

- **Zero-filled Time Series**: Ensures consistent data visualization even with sparse data
- **Statistical Aggregations**: Mean, median, P90 calculations for performance metrics
- **Age Buckets**: Categorizes goals and attendance by time periods
- **Completion Rates**: Tracks success ratios across different time periods

### Session-Based Attendance

Innovative attendance marking system that allows:

- Visual grid layout of all students in a session
- One-click status changes with immediate visual feedback
- Bulk operations for efficient classroom management
- Historical attendance tracking and reporting

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NelakaWith/gloire-road-map.git
   cd gloire-road-map
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Database setup**

   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE gloire_roadmap;"

   # Import schema and seed data
   mysql -u root -p gloire_roadmap < _db/schema.sql
   mysql -u root -p gloire_roadmap < _db/seeds.sql
   ```

4. **Environment configuration**

   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env

   # Edit .env with your database credentials
   # DB_HOST=localhost
   # DB_USER=root
   # DB_PASS=your_password
   # DB_NAME=gloire_roadmap
   # JWT_SECRET=your_jwt_secret
   ```

5. **Start development servers**

   ```bash
   # Backend (port 3000)
   cd backend && npm run dev

   # Frontend (port 5173)
   cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

### Production Deployment

The project includes automated CI/CD pipeline using GitHub Actions. Configure the following secrets:

- `DROPLET_HOST`: Server IP address
- `DROPLET_USER`: SSH username
- `DROPLET_SSH_KEY`: Private SSH key

## 👨‍💻 Author

**Nelaka Withanage**

- GitHub: [@NelakaWith](https://github.com/NelakaWith)
- Portfolio: [nelakawith.netlify.app](https://nelakawith.netlify.app/)
- LinkedIn: [in/nelaka-withanage/](https://www.linkedin.com/in/nelaka-withanage/)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

_This project demonstrates modern full-stack development practices, including clean architecture, comprehensive testing, automated deployment, and user-centered design principles._
