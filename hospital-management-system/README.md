# MediCore HMS — Hospital Management System

A web-based Hospital Management System for managing **patient records,
appointment scheduling, and medical staff**, built to the specification in
*"Design of a Hospital Management System to Manage Patient Records,
Appointments, and Medical Staff in Healthcare Settings"* (Nuhu Isaac
Danladi, National Open University of Nigeria, PGD Project, 2025).

## Architecture

Three-tier, matching the project report:

| Layer | Technology |
|---|---|
| Presentation | React.js (Vite) single-page app |
| Application | Python / Django + Django REST Framework, JWT auth |
| Database | MySQL (falls back to SQLite for zero-setup local use) |

## Features

- **Patient Record Management** — register patients, store demographics,
  allergies, emergency contacts, and a full medical history (diagnosis,
  treatment plan, prescription per visit).
- **Appointment Scheduling** — book, complete, cancel, and reschedule
  appointments; prevents double-booking a doctor at the same date/time.
- **Medical Staff Management** — staff directory (doctors/nurses),
  department & specialization, and shift scheduling with availability
  tracking.
- **User Authentication & Access Control** — JWT-based login with four
  roles (Administrator, Doctor, Nurse, Patient), each seeing only the
  data and actions relevant to them.
- **Reporting & Analytics** — dashboard KPIs, appointment volume trend,
  per-doctor workload, and daily staff-on-shift snapshot.

## Project layout

```
hospital-management-system/
  backend/     Django REST API
  frontend/    React (Vite) SPA
```

## Getting started

### Backend

```bash
cd hospital-management-system/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # defaults to SQLite; set DB_ENGINE=mysql to use MySQL
python manage.py migrate
python manage.py seed_demo_data   # creates demo admin/doctor/nurse/patient accounts
python manage.py runserver
```

API is served at `http://localhost:8000/api/`. Django admin at `/admin/`
(log in with the seeded `admin` account).

To use MySQL instead of SQLite, create a database and set in `.env`:

```
DB_ENGINE=mysql
DB_NAME=hms_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306
```

(`mysqlclient` requires MySQL's dev headers to install — see
[the package docs](https://pypi.org/project/mysqlclient/) if `pip install`
fails on your platform.)

### Frontend

```bash
cd hospital-management-system/frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` to the Django
server on port 8000.

### Demo accounts

Seeded by `seed_demo_data` (password for all: `Passw0rd!`):

| Username | Role |
|---|---|
| `admin` | Administrator |
| `dr.okafor` | Doctor |
| `dr.bello` | Doctor |
| `nurse.johnson` | Nurse |
| `patient.chinedu` | Patient |

## Role permissions summary

| Action | Admin | Doctor | Nurse | Patient |
|---|---|---|---|---|
| View/register patients | ✅ | ✅ | ✅ | own record only |
| Add medical records | ✅ | ✅ | ✅ | ❌ (read own) |
| Book appointments | ✅ | ✅ | ✅ | ✅ (self only) |
| Manage staff accounts | ✅ | ❌ | ❌ | ❌ |
| Assign shifts | ✅ | view own | view own | ❌ |
| View reports/analytics | ✅ | ✅ | ✅ | ❌ |

## Scope notes (per the project report)

Consistent with the thesis's stated scope, this system targets outpatient
workflows for small-to-medium facilities and does **not** include
telemedicine, AI-assisted diagnostics, or third-party EHR integration —
these are listed as future work in the original report.
