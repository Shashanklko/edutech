# EduVera : Student Education & Migration Registry
### Comprehensive Platform Architecture, Statutory Governance Breakdown & Operational Blueprint

---

## 1. Executive Summary & Vision

**EduVera : Student Education & Migration Registry** is a sovereign, federated GovTech platform designed to unify every educational milestone of an Indian citizen—from Class 1 elementary schooling through Senior Secondary boards, undergraduate polytechnics, degree colleges, and doctoral research (Ph.D.)—into an unbroken, Aadhaar-verified academic timeline.

Operating across India's multi-layered federal educational ecosystem, EduVera connects the **Central Ministry of Education (MOE)**, **State Education Directorates (e.g. UP-MOE)**, **Statutory Examination Boards (CBSE, UPMSP / UP Board, CISCE)**, **Higher Education Regulatory Councils (UGC, AICTE)**, and thousands of accredited institutions into a single unified national grid.

### The Core National Challenges Solved:
1. **Ghost Enrollments & Duplicate Welfare Grant Claims:** In the legacy paper paradigm, students could remain registered across multiple institutions in different districts simultaneously. This caused massive financial leakage in mid-day meal grants, free uniform subsidies, and textbook allocations. EduVera enforces the **Zero-Ghost Single-Active Seat Protocol**.
2. **Inter-State Migration Dropouts:** Over 1.5 million students relocate across Indian states annually due to parental employment migration. Physical Transfer Certificates (TC) lost in transit and state-border bureaucratic friction lead to high dropout rates. EduVera implements a **30-Second Gated Digital Transfer Clearance**.
3. **Dropout Alarm & Doorstep Intervention:** When a student is discharged with a TC but fails to enroll in a new institution within 30 days, the **Automated State Dropout Radar** trips an urgent alarm for Block Education Officers (BEOs) to conduct doorstep re-engagement.
4. **Data Isolation & Zero Role Overlap:** K-12 schools operate strictly within Class 1 to 12 parameters (Theory/Practical marks, streams, sections), while Degree Colleges and Universities operate under higher education parameters (Semesters, Course Codes, Credits, SGPA/CGPA, Academic Bank of Credits). Neither tier can view or manipulate the academic instruments of the other.
5. **Statutory Access Control:** Government monitoring bodies (Central MOE and State Directorates) hold **supervisory audit oversight only** (`View Only`). Institution charter issuance, accreditation, and profile creation are strictly delegated to autonomous **Examination Boards** and the **Master Depository Administrator**.

---

## 2. Multi-Tier Statutory Governance Breakdown

EduVera enforces a strict 4-tier chain of administrative authority:

```
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 1: Central Ministry of Education (MOE Apex / National Depository)│
│  • Master Registry Ledger • UIDAI Aadhaar / APAAR Direct Linkage       │
│  • Pan-India Census Surveillance • Interstate Migration Corridors      │
│  • National Scheme Monitoring (Mid-Day Meal, RTE, PM-SHRI)             │
│  • Supervisory Read-Only Audit Oversight across All 36 States & UTs    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 2: State Education Departments (State MOE - e.g. UP-MOE, Delhi) │
│  • State Directorates • District & Block Monitoring (BEOs)             │
│  • In-State Institutions Directory (Territorially Locked • View Only) │
│  • 30-Day Floating TC Dropout Radar & Doorstep Outreach Cases          │
│  • State-to-Central Reporting & Institutional Audit Verification       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 3: Statutory Examination Boards & Regulatory Councils            │
│  • Central School Boards (CBSE, CISCE) • State Boards (UPMSP / UP)     │
│  • Higher Ed Regulators (UGC, AICTE)                                   │
│  • Autonomous Institution Accreditation & Profile Provisioning         │
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

## 3. Four Dedicated Administrative Dashboards

EduVera provides 4 independent administrative dashboard experiences tailored specifically to the operational responsibilities of each authority:

### 3.1. Central Government Dashboard (`CentralDashboard.jsx`)
* **Role**: National Education Monitoring Authority (Ministry of Education / MOE).
* **Modules**:
  - **National Overview**: Real-time counters for national enrollments, total institutions, verified migrations, and active national dropout alerts.
  - **State-wise Education Statistics**: Breakdown table comparing state performance, retention rates, and in-transition percentages across Uttar Pradesh, Delhi, West Bengal, Maharashtra, and other states.
  - **Institution Registry Overview**: Aggregated counts of K-12 secondary schools, undergraduate colleges, and apex universities.
  - **Interstate Student Migration Corridors**: Surveillance of student flows between states (e.g. UP ➔ Delhi NCR ➔ Maharashtra).
  - **National Education Scheme Monitoring**: Status tracking for Mid-Day Meal (PM-POSHAN), Samagra Shiksha, and RTE 25% quota disbursements.
  - **State Report Review**: Interface to review, approve, or request clarification on monthly reports submitted by State Directorates.
  - **Data Quality & Audit Tasks**: Follow-up task dispatcher for resolving unverified citizen records.

### 3.2. State Government Dashboard (`StateDashboard.jsx`)
* **Role**: State Education Ministry / Directorate (e.g. Uttar Pradesh Directorate of Secondary Education `UP-MOE`).
* **Territorial Locking**: Strictly locks all views and institutional audits to institutions physically operating within that state's borders.
* **Modules**:
  - **State Overview**: State enrollment total, active district nodes, and in-state graduation statistics.
  - **District & Block Monitoring**: District-level drilldown (Lucknow, Varanasi, Gautam Buddh Nagar, Kanpur, Prayagraj) tracking BEO outreach.
  - **In-State Institutions Directory (View Only)**: Complete roster of state schools, degree colleges, and universities with zero cross-state leakage.
  - **State Dropout Radar (30+ Day Floating TC Cases)**: Critical intervention feed displaying student names, parents' contact details, discharging school, and days elapsed since TC issuance.
  - **Institutional Verification Requests**: Reviewing transfer logs and data correction petitions submitted by schools.
  - **State-to-Central Report Submissions**: Official reporting channel to submit compliance filings directly to the Central Ministry.

### 3.3. Education Boards Dashboard (`BoardDashboard.jsx`)
* **Role**: Autonomous Examination Authorities (CBSE, UP Board / UPMSP, CISCE, UGC).
* **Scope**: Operates independently by board charter—CBSE manages only CBSE-affiliated schools; UPMSP manages only UP Board schools.
* **Modules**:
  - **Board Overview**: Total affiliated institutions, candidate enrollments, examination batches, and pass percentages.
  - **Affiliated Institution Registry**: Searchable ledger of affiliated institutions with affiliation codes and regional desks.
  - **Accredit / Provision New Institution**: Dedicated capability to create and accredit new academic institution profiles.
  - **Examination Registration & Candidate Records**: Final roll number issuance for Class 10 (Secondary) and Class 12 (Senior Secondary).
  - **Certified Results & Marksheet Vault**: Publishing official term/annual marks with tamper-evident digital seals.
  - **Agency Background Verification (BGV) Desk**: Approving academic verification requests submitted by employers and foreign universities under DPDP guidelines.

### 3.4. Educational Institution Dashboard (`InstitutionDashboard.jsx`)
* **Role**: Institutional Desks adapting automatically by tier (`school`, `college`, `university`).
* **Modules**:
  - **Institution Overview**: Active student strength, daily attendance percentage, pending admission requests, and outbound TCs.
  - **Admissions & Gated Transfer Clearance Hub**: 1-click admission by Aadhaar/USI and cryptographic TC issuance.
  - **Class / Program Roster**: Student directory filtered strictly by the institution's offerings:
    - *Schools*: Classes 1–12, Sections (A/B/C), Theory/Practical marks.
    - *Colleges*: Degrees (B.Tech, B.Sc, B.Com), Semesters 1–8, Credits, SGPA.
    - *Universities*: Postgraduate, Ph.D, Research publications, Convocation seals.
  - **Institutional Profile & Digital Seal**: Public details, affiliation certificate, principal contact, and institutional security keys.
  - **Operator Management**: Sub-desk passkey generation for admission officers and examination invigilators.

---

## 4. Core Operational Features & Protocols

### 4.1. Anti-Ghost Single-Active Seat Protocol
* Every student profile holds a strict status flag: `Active`, `Transferred`, or `Passed`.
* When a student is enrolled in School A, their status is locked to School A's Registry ID.
* If School B attempts to enroll the student without an official transfer clearance, the system rejects the transaction with an **Anti-Ghost Conflict (HTTP 409)**.
* **Outcome**: Stops double-enrollment fraud, eliminating duplicate claims for welfare allowances and mid-day meal budgets.

### 4.2. 30-Second Gated Digital Transfer (TC) Protocol
* When a student relocates, the parent/guardian initiates a transfer request.
* The releasing institution marks the student as `Transferred`, issues a cryptographic Transfer Certificate (TC) number (e.g., `TC-2024-0091`), records conduct and leaving reason, and vacates the seat immediately.
* The receiving institution enters the student's 12-digit Aadhaar number or Lifelong USI in the Admissions Hub, verifies academic history, and completes admission in seconds.

### 4.3. Automated State Dropout Radar & 30-Day BEO Outreach
* An automated query evaluates all un-enrolled students with `status: 'Transferred'`.
* **Day 1 to 14**: Normal transition grace period (Green).
* **Day 15 to 29**: Advisory warning; SMS alert dispatched to parent (Amber).
* **Day 30+**: **Critical Dropout Alarm (Red)**. The profile is flagged on the State MOE Console with the parent's phone number and home address. A Block Education Officer (BEO) is formally tasked with visiting the household to re-enroll the child.

### 4.4. Statutory Access Control (Government View-Only vs Board Provisioning)
* **Government Users (Central MOE & State Directorates)**:
  - Role: Audit & Monitoring.
  - Permissions: Read-only access to institutions, student rosters, and macro analytics.
  - Restrictions: Cannot create institution profiles; cannot reset operator passcodes.
* **Examination Boards & Master Depository Admin**:
  - Role: Accreditation & Management.
  - Permissions: Provision new institution profiles, issue affiliation charters, reset institution passcodes, and publish board results.

### 4.5. In-State Territorial Scope Enforcement
* When logged in as a State Directorate (e.g. `UP-MOE`, Shri Virendra Tripathi):
  - The Institutions Directory automatically locks to `state: 'Uttar Pradesh'`.
  - All category filters ("Universities & Apex", "Degree Colleges", "Secondary Schools") strictly evaluate **only within Uttar Pradesh**.
  - Delhi, West Bengal, and Maharashtra institutions are completely excluded from the State Directorate's view.

---

## 5. Differentiated Academic Data Engines

| Dimension | K-12 School Standard | Higher Education College / University |
| :--- | :--- | :--- |
| **System Prefix** | `SCH-YYYY-XXX` | `CLG-YYYY-XXX` / `UNIV-YYYY-XXX` |
| **Class / Year** | Classes 1 to 12 | Semesters 1 to 8, Annual |
| **Organization** | Class, Section (A/B/C), Stream | Department, Program, Branch |
| **Academic Identifier** | School Roll No, Board Roll No | PRN / University Enrollment Number |
| **Grading Model** | Theory Marks (70) + Practical Marks (30) = Marks / Max Marks (100) | Course Code (CS101), Credits (4), Grade Point (10), Letter Grade (O, A+, A) |
| **Performance Metric**| Percentage %, Terminal Grade (A1, A2, B1) | Semester GPA (SGPA), Cumulative GPA (CGPA) |
| **National ID** | PEN (Permanent Education Number) | ABC ID (Academic Bank of Credits / APAAR) |
| **Exit Document** | School Leaving Transfer Certificate (TC) | Degree Certificate, Consolidated Transcript, Migration |

---

## 6. Technical Architecture & Schemas

### 6.1. System Architecture Diagram

```
[ Citizen Browser / Institutional Terminal ]
                    │
                    ▼
[ React 18 + Vite + Tailwind CSS ]  (Client/)
  ├── Landing Page & 4-Tier Dashboard Selector
  ├── Central, State, Board & Institution Dashboards
  ├── Institutions Registry Directory (Territorially Locked)
  ├── Multi-Tier Admissions & Transfer Clearance Hub
  ├── Student Dossier & Academic Transcripts
  └── Sub-Desk Operator Key Management
                    │
                    ▼  (REST API / JSON via Express)
[ Node.js + Express MVC Layer ]     (Server/)
  ├── Controllers (authController, studentController, schoolController, statsController, ...)
  ├── Services (authService, studentService, schoolService, statsService, operatorService, ...)
  └── Models (User, School, Student, Operator, Task, Report)
                    │
                    ▼  (Mongoose ODM)
[ MongoDB Document Store ]          (mongodb://127.0.0.1:27017/eduvera_db)
  ├── users (Master Admins, Central/State Authorities, Board Officials)
  ├── schools (Institutions, State, Affiliation, Tier, Password)
  ├── students (Aadhaar, USI, Marks, Timeline, TC Number, Status)
  ├── operators (Sub-desk Delegated Roles & Keys)
  ├── tasks (Action Items, BEO Dropout Cases, Verification Workflows)
  └── reports (State-to-Central Compliance Filings)
```

### 6.2. Key Database Models

#### `School` Model ([`Server/models/School.js`](file:///d:/Project/edutech/Server/models/School.js))
* `_id` (String): Standardized Registry ID (e.g. `SCH-CBSE-01`, `CLG-UP-01`, `UNIV-UP-01`).
* `name` (String): Official registered institution name.
* `state` (String): Territorial jurisdiction (e.g. `Uttar Pradesh`, `Delhi`, `Maharashtra`).
* `region` (String): District / Regional division.
* `institutionType` (String): `'school'`, `'college'`, or `'university'`.
* `boardCode` (String): Affiliated board (e.g. `'CBSE'`, `'UP-BOARD'`, `'CISCE'`, `'UGC'`).
* `affiliation` (String): Detailed charter description.
* `establishedYear` (Number): Year established.
* `principalName` (String): Head of institution.

#### `Student` Model ([`Server/models/Student.js`](file:///d:/Project/edutech/Server/models/Student.js))
* `studentId` (String): Lifelong Unique Student Identifier (USI).
* `aadhaarNumber` (String): 12-digit Aadhaar number (encrypted & masked in UI).
* `name` (String): Student's legal full name.
* `schoolId` (String): Reference to current active institution.
* `currentClass` (String): Current standard or semester (e.g. `Class 10`, `B.Tech Semester 4`).
* `status` (String): `'Active'`, `'Transferred'`, or `'Passed'`.
* `tcDetails` (Object): `{ tcNumber, issueDate, reason, destinationSchool, transferDate }`.
* `academicHistory` (Array): Chronological ledger of all attended institutions with marks and certificates.

---

## 7. REST API Endpoints Reference

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Administrative login (User ID / Password) | Public |
| `POST` | `/api/student/login` | Student citizen login (Student ID + Aadhaar) | Public |
| `GET` | `/api/schools` | List institutions (supports `?state=`, `?board=`, `?type=`) | Authenticated |
| `POST` | `/api/schools` | Register new institution (Admin / Board Only) | **Admin / Boards Only (403 for Govt)** |
| `POST` | `/api/schools/generate-id` | Generate standardized System Registry ID | Authenticated |
| `POST` | `/api/schools/:id/reset-password` | Reset institution access key | **Admin / Boards Only** |
| `GET` | `/api/students` | Get enrolled students for active institution | Institution / Board / Audit |
| `POST` | `/api/students/admit` | Admit student / process incoming transfer | Institution Desk |
| `POST` | `/api/students/transfer` | Issue Transfer Certificate & vacate seat | Institution Desk |
| `GET` | `/api/students/:id` | Get full academic dossier & verified timeline | Authenticated |
| `GET` | `/api/stats/national` | National census & state-wise metrics | Central MOE / Admin |
| `GET` | `/api/stats/state` | State metrics & 30-day floating TC dropout list | State MOE / Admin |
| `GET` | `/api/operators` | List sub-desk operators for institution | Authenticated |
| `POST` | `/api/operators` | Create new sub-desk operator passkey | Institution / Admin |
| `GET` | `/api/tasks` | List administrative tasks & BEO outreach cases | Authenticated |
| `PUT` | `/api/tasks/:id` | Update task status or record resolution | Authenticated |
| `GET` | `/api/reports` | List submitted statutory reports | Central / State MOE |
| `POST` | `/api/reports` | Submit new compliance report to Central MOE | State MOE |

---

## 8. Seeded Master Directory

The platform includes a pre-seeded national test dataset:

### A. Central & State Authorities
| Tier / Authority | Account ID | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Top Platform Lead Admin** | `ADMIN` | `admin123` | National master console, unrestricted provisioning |
| **Central Ministry of Education** | `MOE` | `admin123` | Central MOE Apex, interstate mobility, national census (**View Only**) |
| **UP Directorate of Education** | `UP-MOE` | `admin123` | Uttar Pradesh state monitoring, dropout radar (**View Only**) |
| **Central School Board** | `CBSE` | `admin123` | Provision CBSE schools, board roll numbers, marksheets |
| **State School Board** | `UP-BOARD` | `admin123` | Provision UPMSP schools, matric/intermediate vaults |

### B. Educational Institutions (14 Seeded Nodes)
| Institution Name | Registry ID | State | Tier | Affiliation |
| :--- | :--- | :--- | :--- | :--- |
| **Delhi Public School (DPS Noida)** | `SCH-CBSE-01` | Uttar Pradesh | School | CBSE Affiliated #2130054 |
| **Government Inter College (GIC Lucknow)** | `SCH-UP-01` | Uttar Pradesh | School | UPMSP Recognized #UP-LKO-001 |
| **Varanasi Model Inter College** | `SCH-UP-02` | Uttar Pradesh | School | UPMSP Model School #UP-VNS-002 |
| **National Post Graduate College (Lucknow)**| `CLG-UP-01` | Uttar Pradesh | College | Autonomous Lucknow Univ / UGC AISHE-C-27418 |
| **AKTU Lucknow (State Technical Univ)** | `UNIV-UP-01` | Uttar Pradesh | University | Dr. A.P.J. Abdul Kalam Technical University |
| **BHU Varanasi (Central Apex Univ)** | `UNIV-BHU` | Uttar Pradesh | University | Banaras Hindu University / AISHE-U-0500 |
| **Kendriya Vidyalaya (KV Delhi Cantt)** | `SCH-CBSE-02` | Delhi | School | KVS / CBSE #DL018 |
| **ABC Public School (CBSE)** | `SCH001` | Delhi | School | CBSE Affiliated #2130045 |
| **St. Stephen's College (Delhi University)**| `CLG-DU-01` | Delhi | College | UGC AISHE-C-DU01 |
| **Indian Institute of Technology Delhi** | `IIT-DELHI` | Delhi | University | Institute of National Importance |
| **University of Delhi (DU)** | `UNIV-DU` | Delhi | University | Central University |
| **Delhi Technological University (DTU)** | `UNIV001` | Delhi | University | State University / AICTE |
| **Modern Senior Secondary School** | `SCH002` | West Bengal | School | CBSE Affiliated #1930211 |
| **St. Xavier's Model High School** | `SCH003` | Maharashtra | School | ICSE Affiliated #MH042 |

### C. Sample Student Citizens
| Student Name | USI (ID) | Aadhaar Number | Current Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Verma** | `AARAV052015` | `111122223333` | Class 5 (Primary) | Active @ GIC Lucknow (UP) |
| **Ananya Patel** | `ANANYA062014` | `222233334444` | Class 6 (Middle) | Active @ KV Delhi Cantt (DL) |
| **Rohan Gupta** | `ROHAN092003` | `999900001111` | Class 7 (Middle) | Active @ DPS Noida (UP) |
| **Sneha Sen** | `SNEHA042007` | `333344445555` | Class 9 (Secondary) | Active @ Modern Sec (WB) |
| **Rahul Sharma** | `RAHUL052010` | `555566667777` | Class 10 (Secondary) | Active @ DPS Noida (UP) |
| **Arjun Kapoor** | `ARJUN052010` | `666677778888` | Class 10 (Discharged) | **Floating TC (30+ Days) - Red Dropout Alarm** |
| **Vikramaditya Rao** | `VIKRAM012009` | `777788889999` | Class 11 Science | Active @ DPS Noida (UP) |
| **Priya Sharma** | `PRIYA082008` | `888899990000` | Class 12 Commerce | Active @ DPS Noida (UP) |
| **Kabir Mehta** | `KABIR2022CS` | `987654321098` | B.Tech Undergrad (Sem 4) | Active @ University of Delhi (DL) |
| **Devansh Saxena** | `DEVANSH-IITD-2024`| `123456789012` | B.Tech Graduate (9.42 CGPA)| Passed @ IIT Delhi (DL) |

---

## 9. How to Run & Verify

### 9.1. Local Installation & Seeding
```bash
# 1. Install dependencies
npm run install:all

# 2. Seed database
npm run seed

# 3. Execute 21-Test Automated Suite
npm test
# Result: 21 Passed, 0 Failed (100% Pass Rate)

# 4. Start local development servers
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

---

## 10. Vercel & Production Cloud Deployment Guide

### Step 1: Deploy Frontend to Vercel
1. Push the repository to GitHub.
2. In the **Vercel Dashboard**, click **"Add New Project"** and select the repository.
3. Configure the Project:
   * **Root Directory**: Leave as `./` (or select `Client`).
   * **Framework Preset**: `Vite`.
   * **Build Command**: `npm run build` (or `npm --prefix Client run build`).
   * **Output Directory**: `Client/dist` (or `dist` if Root Directory is `Client`).
4. **Environment Variables**:
   * Add `VITE_API_BASE_URL` = `https://your-backend-api.onrender.com` (your deployed backend URL).
5. Click **Deploy**. Vercel will build the React SPA and apply [`vercel.json`](file:///d:/Project/edutech/vercel.json) rewrites to guarantee zero 404 errors on browser page reloads.

### Step 2: Deploy Backend Server (Render / Railway)
1. In **Render** or **Railway**, create a new Web Service connecting to the same repository.
2. Set Root Directory to `Server`.
3. Set Build Command to `npm install`.
4. Set Start Command to `node server.js`.
5. Add Environment Variables:
   * `PORT` = `5000` (or leave default assigned by provider).
   * `MONGODB_URI` = `mongodb+srv://<username>:<password>@cluster0.mongodb.net/eduvera_db?retryWrites=true&w=majority`.
6. Once deployed, run the seed script once via the deployment console (`node seed_mongodb.js`).
7. Update `VITE_API_BASE_URL` in your Vercel project settings with your live backend service URL.

---

*EduVera : Sovereign Student Education & Migration Registry — Empowering 1.4 Billion Learners with an Unbroken, Sovereign Academic Timeline.*
