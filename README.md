# Smart Urban Governance Portal for Pothole Management in Mira-Bhayandar (MBMC)

A centralized civic web platform developed for the **Mira-Bhayandar Municipal Corporation (MBMC)** that allows citizens to report road hazards/potholes, pinpoint exact coordinates using GIS maps, and enables municipal engineers to assign, track, and resolve complaints transparently.

---

## 🏛️ Project Objective & Workflow

The portal implements a 5-step closed-loop civic governance pipeline:

$$\text{Report} \longrightarrow \text{Locate} \longrightarrow \text{Assign} \longrightarrow \text{Track} \longrightarrow \text{Resolve}$$

1. **Report**: Citizen uploads a photograph and describes road damage severity.
2. **Locate**: Pinpoint coordinates on Leaflet.js / OpenStreetMap with auto-geocoding.
3. **Assign**: Municipal admin routes the grievance to the Road Department or Municipal Engineering Department.
4. **Track**: Real-time status timeline (**Pending $\rightarrow$ In Progress $\rightarrow$ Resolved**) accessible with unique ID (e.g. `MBMC-PTH-001`).
5. **Resolve**: Engineering units execute road repairs and update verification status.

---

## 💻 Technology Stack

* **Frontend**: React.js (Vite), React Router v6, Axios
* **Styling**: Vanilla CSS (Responsive Design, Custom Civic Theme, Badges, Modals)
* **Backend**: Python Flask 3.1, RESTful Blueprints, Werkzeug Security, Flask-JWT-Extended
* **Database**: SQLite with Flask-SQLAlchemy ORM
* **Maps**: Leaflet.js & OpenStreetMap (Interactive pin picker, status-based color markers)
* **Charts**: Chart.js & react-chartjs-2 (Status doughnut chart, Severity distribution bar chart)
* **API Testing**: Postman Collection included (`backend/postman_collection.json`)

---

## 🗄️ Database Design

SQLite Database: `backend/database/pothole_governance.db`

### 1. `users`
* `id` (INTEGER, Primary Key)
* `name` (VARCHAR)
* `email` (VARCHAR, Unique, Indexed)
* `mobile` (VARCHAR)
* `password_hash` (VARCHAR, Werkzeug hashed)
* `role` (VARCHAR: `citizen` or `admin`)
* `created_at` (DATETIME)

### 2. `complaints`
* `id` (INTEGER, Primary Key)
* `complaint_id` (VARCHAR, Unique, Indexed, e.g., `MBMC-PTH-001`)
* `user_id` (INTEGER, Foreign Key to `users.id`, Nullable)
* `description` (TEXT)
* `severity` (VARCHAR: `Low`, `Medium`, `High`)
* `photo` (VARCHAR, image filename)
* `location_name` (VARCHAR, street/landmark)
* `latitude` (FLOAT)
* `longitude` (FLOAT)
* `status` (VARCHAR: `Pending`, `In Progress`, `Resolved`)
* `created_at` (DATETIME)
* `updated_at` (DATETIME)

### 3. `departments`
* `id` (INTEGER, Primary Key)
* `department_name` (VARCHAR, Unique)
* `created_at` (DATETIME)

### 4. `assignments`
* `id` (INTEGER, Primary Key)
* `complaint_id` (INTEGER, Foreign Key to `complaints.id`)
* `department_id` (INTEGER, Foreign Key to `departments.id`)
* `notes` (VARCHAR)
* `assigned_at` (DATETIME)

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 1. Backend Setup (Flask)
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using the provided venv in root or backend)
..\venv\Scripts\activate   # Windows
# or: source venv/bin/activate (Linux/Mac)

# Install requirements
pip install -r requirements.txt

# Seed sample data (users, departments, realistic Mira-Bhayandar coordinates)
python seed.py

# Start Flask Backend server
python app.py
```
*Backend runs on:* `http://127.0.0.1:5000`

### 2. Frontend Setup (React + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🔑 Demo Credentials for College Presentation

| Role | Email | Password | Pre-populated Data |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@mbmc.gov.in` | `admin123` | Full dashboard access, department assignment, status updates, chart analytics |
| **Citizen** | `citizen@example.com` | `citizen123` | Can file complaints, track own grievances |

> **Pro Tip**: The Login page features quick **"Fill Admin"** and **"Fill Citizen"** demo buttons for 1-click credential autofill during evaluation presentations.

---

## 🧪 Postman API Testing

An official Postman collection is included in [backend/postman_collection.json](file:///c:/Users/pragy/Downloads/Civicflow/backend/postman_collection.json).

### Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register citizen / admin |
| `POST` | `/api/auth/login` | Login and obtain JWT token |
| `GET` | `/api/auth/me` | Fetch current authenticated user |
| `POST` | `/api/complaints` | Submit new pothole complaint (multipart with photo) |
| `GET` | `/api/complaints` | List complaints (with status, severity, and search filters) |
| `GET` | `/api/complaints/<id>` | Fetch complaint by `MBMC-PTH-XXX` or numeric ID |
| `GET` | `/api/complaints/map` | Get lightweight coordinates and markers for GIS map |
| `GET` | `/api/stats/dashboard` | Get aggregate KPI metrics for landing page & charts |
| `PUT` | `/api/admin/complaints/<id>/status` | Update status (`Pending` / `In Progress` / `Resolved`) |
| `POST` | `/api/admin/complaints/<id>/assign` | Assign complaint to department |
| `DELETE`| `/api/admin/complaints/<id>` | Delete invalid report |
| `GET` | `/api/admin/departments` | List all municipal departments |
| `POST` | `/api/admin/departments` | Add new department |
| `GET` | `/uploads/<filename>` | Serve uploaded pothole photographs |

---

## 📁 Project Structure

```text
Civicflow/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Consistent civic navigation
│   │   │   └── Footer.jsx          # MBMC civic footer & helpline
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page with KPIs & 5-step workflow
│   │   │   ├── LoginPage.jsx       # Citizen/Admin login with demo autofill
│   │   │   ├── ReportPotholePage.jsx # Photo upload & Leaflet coordinate picker
│   │   │   ├── TrackComplaintPage.jsx# Visual status stepper & resolution log
│   │   │   ├── PotholeMapPage.jsx  # Leaflet + OpenStreetMap GIS view
│   │   │   └── AdminDashboardPage.jsx# Chart.js analytics & management table
│   │   ├── services/
│   │   │   └── api.js              # Axios service layer with JWT interceptor
│   │   ├── utils/
│   │   │   └── leafletIcons.js     # Color-coded custom SVG map pins
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── index.css               # Design system & responsive styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app.py                      # Flask factory, CORS, JWT, Blueprints
│   ├── config.py                   # SQLite database & upload folder config
│   ├── models.py                   # SQLAlchemy schema (User, Complaint, Dept, Assignment)
│   ├── seed.py                     # Realistic Mira-Bhayandar sample dataset
│   ├── postman_collection.json     # Ready-to-import Postman testing collection
│   ├── requirements.txt
│   ├── database/
│   │   └── pothole_governance.db   # SQLite database file
│   ├── uploads/                    # Pothole photographs directory
│   └── routes/
│       ├── auth_routes.py          # Authentication & JWT endpoints
│       ├── complaint_routes.py     # Public complaint submission & tracking
│       └── admin_routes.py         # Admin management, charts, assignment
│
└── README.md
```
