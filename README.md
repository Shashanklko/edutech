# EduVera : Sovereign Student Education & Migration Registry

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20MVC%20Layered-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-React%2018%20%7C%20Node.js%20%7C%20MongoDB-indigo.svg)]()
[![Governance](https://img.shields.io/badge/Governance-4--Tier%20Federal%20Model-purple.svg)]()
[![License](https://img.shields.io/badge/License-Statutory%20GovTech-slate.svg)]()

> A sovereign, federated GovTech platform connecting 1.4 billion citizens across primary schools, secondary examination boards, polytechnics, undergraduate colleges, and apex research universities under an unbroken, verified academic timeline.

---

## 🏛️ Executive Summary & Real-World Impact

EduVera fundamentally modernizes national education tracking and inter-state student mobility:
1. **Zero-Ghost Single-Active Seat Protocol**: A student can strictly hold only one active enrollment nationally. Stops fraudulent duplicate school enrollments across districts, eliminating grant leakage in mid-day meal allocations, free uniforms, and textbook subsidies.
2. **30-Second Gated Digital Transfer (TC) Protocol**: Replaces paper Transfer Certificates with cryptographic, document-verified electronic migration between institutions across all Indian states.
3. **Automated State Dropout Radar**: Students holding an unadmitted floating Transfer Certificate for **30+ days** automatically trip an urgent dropout alarm routed to local Block Education Officers (BEOs) for doorstep intervention.
4. **Strict Statutory Governance Separation**:
   - **Government Ministries & State Directorates** (`Central MOE`, `UP-MOE`): Hold **supervisory audit oversight only** (`View Only`). They monitor macro metrics, inspect rosters, and review reports, but cannot register institutions or alter passcodes.
   - **Autonomous Examination Boards** (`CBSE`, `UPMSP / UP Board`, `CISCE`, `UGC/AICTE`) & **Platform Master Admin (`ADMIN`)**: Accredit, charter, and provision institution profiles, assign board roll numbers, and publish certified examination results.
5. **Differentiated Academic Data Engines (Zero Role Overlap)**:
   - **K-12 Schools (`SCH-`)**: Classes 1–12, Sections, Streams, Theory/Practical terminal marks, School Leaving TCs. School operators have zero access to university degree programs.
   - **Colleges & Universities (`CLG-` / `UNIV-`)**: Undergraduate & Postgraduate programs, Semesters 1–8, PRN, Academic Bank of Credits (ABC / APAAR), SGPA/CGPA, and Convocation seals.

---

## 🏗️ 4-Tier Administrative Governance Model

```
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 1: Central Ministry of Education (MOE Apex / National Depository)│
│  • National Overview • Pan-India Census Surveillance                   │
│  • Interstate Student Migration Corridors • National Scheme Tracking   │
│  • Read-Only Audit Oversight across All States                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 2: State Education Departments (State MOE - e.g. UP-MOE, Delhi) │
│  • State & District Overview • Block-Level Monitoring (BEOs)           │
│  • In-State Institutions Directory (Territorially Locked • View Only) │
│  • 30-Day Floating TC Dropout Radar & Doorstep Outreach Cases          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 3: Autonomous Examination Boards & Regulatory Councils           │
│  • Central School Boards (CBSE, CISCE) • State Boards (UPMSP / UP)     │
│  • Higher Ed Regulators (UGC, AICTE)                                   │
│  • Institution Accreditation & Profile Provisioning                    │
│  • Candidate Records, Roll Numbers, Marksheets & Result Publication    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 4: Accredited Operating Desks (Zero Cross-Tier Overlap)          │
├─────────────────────────┬────────────────────────┬─────────────────────┤
│ 🏫 K-12 School Desk     │ 🎓 Degree College Desk │ 🏛️ Apex University │
│ • Primary to Sr Sec     │ • Undergrad Degrees    │ • Postgrad & Ph.D   │
│ • Classes 1 to 12 only  │ • B.Tech, B.Sc, MBBS   │ • Doctoral Research │
│ • Single-Active Seat    │ • Semesters 1 to 8     │ • Convocation Seal  │
│ • Digital Transfer Cert │ • ABC ID / Credits     │ • Official Dossier  │
└─────────────────────────┴────────────────────────┴─────────────────────┘
```

---

## 📂 Layered MVC Architecture

```
edutech/
├── Client/                         # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboards/         # 4 Modular Administrative Dashboards
│   │   │   │   ├── CentralDashboard.jsx      # Tier 1: National MOE Overview & Interstate Migration
│   │   │   │   ├── StateDashboard.jsx        # Tier 2: State Directorate, BEO Cases, Dropout Radar
│   │   │   │   ├── BoardDashboard.jsx        # Tier 3: Autonomous Boards (CBSE/UPMSP)
│   │   │   │   ├── InstitutionDashboard.jsx  # Tier 4: School / College / University Desk
│   │   │   │   └── TaskManagementHub.jsx     # Administrative Follow-up & Task Routing
│   │   │   ├── Navbar.jsx          # National Government Banner, Role Badges & Quick Access
│   │   │   ├── Sidebar.jsx         # Role-Filtered Navigation (Audit vs Management)
│   │   │   └── DashboardLayout.jsx # Master Layout Wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # National Portal Hero & 4-Tier Dashboard Chooser
│   │   │   ├── ListedSchools.jsx   # Institutions Registry with Territorial Jurisdiction Locking
│   │   │   ├── AddSchool.jsx       # Board/Admin Institution Accreditation (Guarded)
│   │   │   ├── AdmissionsHub.jsx   # Admissions & Gated Transfer Clearance Hub
│   │   │   ├── CurrentStudents.jsx # In-Institution Enrolled Student Roster
│   │   │   ├── StudentDetails.jsx  # Student Academic Dossier & Unbroken Timeline
│   │   │   └── OperatorManagement.jsx # Desk Operator Passkey & Access Management
│   │   ├── context/AuthContext.jsx # Sovereign Authentication & Session State
│   │   └── main.jsx                # Application Entry & Dynamic Cloud API Base URL
│   ├── vercel.json                 # Vercel SPA Routing & API Proxy Rewrites
│   └── package.json
│
├── Server/                         # Express.js REST API Backend
│   ├── config/db.js                # Dual Connection (Atlas + Local 127.0.0.1 Fallback)
│   ├── models/                     # Mongoose Schemas with Virtuals & Validation
│   │   ├── School.js               # Institutions with State, Board, Type & Credentials
│   │   ├── Student.js              # Aadhaar, USI, Academic Record, Status & TC Details
│   │   ├── User.js                 # Administrative Accounts (Central, State, Board, School)
│   │   ├── Operator.js             # Sub-Desk Delegated Operator Passkeys
│   │   ├── Task.js                 # Administrative Follow-up Tasks & BEO Action Items
│   │   └── Report.js               # State-to-Central Statutory Reports
│   ├── controllers/                # HTTP Request Transport & Status Handling
│   │   ├── authController.js
│   │   ├── schoolController.js
│   │   ├── studentController.js
│   │   ├── statsController.js
│   │   ├── operatorController.js
│   │   ├── taskController.js
│   │   └── reportController.js
│   ├── services/                   # Pure Core Business Logic Layer
│   │   ├── authService.js
│   │   ├── schoolService.js        # Statutory Permissions & Automated ID Standardization
│   │   ├── studentService.js       # Anti-Ghost Lock & Single-Active Seat Enforcement
│   │   ├── statsService.js         # National & State Level Aggregations
│   │   ├── operatorService.js      # Operator Key Generation & Passcode Hashing
│   │   ├── taskService.js          # Task Workflows & Resolution
│   │   └── reportService.js        # Report Submission & Central Review
│   ├── routes/                     # Modular API Route Definitions
│   ├── seed_mongodb.js             # Database Seeder (14 Institutions, 19 Users, 11 Students)
│   ├── test_mock_suite.js          # 21-Test Comprehensive Multi-Tier Automated Test Suite
│   └── server.js                   # Application Entry, Middleware & Static SPA Serving
│
├── vercel.json                     # Root Vercel Deployment Configuration
├── package.json                    # Monorepo Scripts (`build`, `start`, `test`, `seed`)
└── PLATFORM_SPECIFICATION.md       # Comprehensive Technical & Statutory Blueprint
```

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB Community Edition running on `127.0.0.1:27017` (or MongoDB Atlas URI in `Server/.env`)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd edutech

# Install dependencies for both Client and Server
npm run install:all
```

### 3. Seed Database
```bash
npm run seed
# Output:
# ✅ Seeded 14 institutions (CBSE, UP Board, IIT Delhi, DU, DTU, AKTU, BHU)
# ✅ Seeded 19 Master Admin accounts
# ✅ Seeded 15 Sub-Desk Operators
# ✅ Seeded 11 Student Citizens (Class 1-12, B.Tech, Ph.D, Floating TC)
# ✅ Seeded 9 Administrative Tasks & 3 Statutory Reports
```

### 4. Execute Automated Test Suite
```bash
npm test
# Runs 21 comprehensive test cases validating all 4 tiers, Anti-Ghost locks, 
# and Dropout Radar. Expect: 21 Passed, 0 Failed out of 21 Tests (100% Pass Rate).
```

### 5. Run Locally
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend (Vite Dev Server - Port 5173)
npm run dev:client
```
Visit `http://localhost:5173` in your browser.

---

## 🔑 Quick Test Credentials Directory

| Governance Tier | Account ID | Password | Representative Authority | Permitted Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Top Platform Admin** | `ADMIN` | `admin123` | National Depository Lead System Admin | System-wide master provisioning |
| **Central Government** | `MOE` | `admin123` | Ministry of Education (Central MOE) | National audit oversight & census (**View Only**) |
| **State Government** | `UP-MOE` | `admin123` | UP Directorate of Education (Shri Virendra Tripathi) | Uttar Pradesh state monitoring & dropout radar (**View Only**) |
| **Central School Board** | `CBSE` | `admin123` | Central Board of Secondary Education | Provision CBSE schools, exams & marksheets |
| **State School Board** | `UP-BOARD` | `admin123` | UPMSP (Uttar Pradesh Madhyamik Shiksha Parishad) | Provision UP Board schools, matric/inter exams |
| **CBSE School** | `SCH-CBSE-01` | `admin123` | Delhi Public School (DPS Noida, UP) | K-12 Student admissions, Class 9-12 marks, TCs |
| **UP Board School** | `SCH-UP-01` | `admin123` | Government Inter College (GIC Lucknow, UP) | K-12 Student admissions, Class 1-10 marks, TCs |
| **Autonomous College** | `CLG-UP-01` | `admin123` | National PG College (Autonomous Lucknow, UP) | Undergraduate programs, Semesters, Credits |
| **Central Degree College** | `CLG-DU-01` | `admin123` | St. Stephen's College (Delhi University) | Undergraduate degree admissions & transcripts |
| **State Technical Univ** | `UNIV-UP-01` | `admin123` | Dr. A.P.J. Abdul Kalam Technical University (AKTU Lucknow) | B.Tech, M.Tech, Ph.D & University degrees |
| **Central Apex Univ** | `UNIV-BHU` | `admin123` | Banaras Hindu University (BHU Varanasi, UP) | Central university degrees & research clearance |
| **Apex National Univ** | `IIT-DELHI` | `admin123` | Indian Institute of Technology Delhi | B.Tech, M.Tech, Doctoral convocation dossiers |
| **Student Citizen (K-12)** | `RAHUL052010` | Aadhaar: `555566667777` | Rahul Sharma (Class 10 CBSE, Active) | Citizen Timeline & Verified Marksheet |
| **Student Citizen (Dropout)** | `ARJUN052010` | Aadhaar: `666677778888` | Arjun Kapoor (Class 10 UP Board) | **Floating TC (30+ Days) - Red Dropout Alarm** |
| **Student Citizen (Grad)** | `DEVANSH-IITD-2024`| Aadhaar: `123456789012` | Devansh Saxena (B.Tech Graduate, 9.42 CGPA) | Convocation Dossier & University Transcript |

---

## 🌐 Cloud Deployment Guide (Vercel + Backend)

### Method 1: Deploy Frontend to Vercel (Recommended)
1. **Push your repository** to GitHub / GitLab.
2. In the **[Vercel Dashboard](https://vercel.com)**, click **"New Project"** and import this repository.
3. If setting the Root Directory:
   - **Option A (Root)**: Keep Root Directory as `./`. Vercel will automatically read root [`vercel.json`](file:///d:/Project/edutech/vercel.json) and run `npm run build`.
   - **Option B (Client Directory)**: Set Root Directory to `Client`. Vercel will detect Vite and use [`Client/vercel.json`](file:///d:/Project/edutech/Client/vercel.json).
4. **Environment Variables**:
   - Add `VITE_API_BASE_URL` with your deployed backend URL (e.g., `https://your-api.onrender.com` or `https://your-server.railway.app`).
5. Click **Deploy**. Vercel will build the frontend and serve it with clean SPA URL routing (preventing 404s on browser reload).

### Method 2: Deploy Backend to Render / Railway / Fly.io
1. Create a new Web Service on **Render** or **Railway**.
2. Set Root Directory to `Server` (or build command `npm --prefix Server install`).
3. Set Start Command to `node server.js`.
4. Configure Environment Variables:
   - `PORT`: `5000` (or host assigned)
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
5. Once deployed, copy your backend URL and paste it into Vercel's `VITE_API_BASE_URL`.

---

## 🛡️ Statutory Data Privacy & Security

- **DPDP Act 2023 Compliance**: Private agencies and external employers cannot scrape or search student directories. Verifications are strictly routed through the Central Education Board.
- **Aadhaar Masking**: Aadhaar numbers are securely hashed and masked (`XXXX-XXXX-7890`) in all UI presentations.
- **Zero Role Encroachment**: Server-side role assertions guarantee that school operators cannot write degree records, and government audit officers cannot tamper with school credentials or rosters.

---

For complete statutory specifications, detailed database schemas, and protocol diagrams, see:
👉 **[`PLATFORM_SPECIFICATION.md`](file:///d:/Project/edutech/PLATFORM_SPECIFICATION.md)**

 
