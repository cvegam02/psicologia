# psicologIA - Implementation Plan

`psicologIA` is a clinical management system designed for psychologists, featuring a PWA for web and mobile use, role-based access control, and WhatsApp integration for reminders.

## User Review Required

> [!IMPORTANT]
> - **WhatsApp Integration**: Do you have a preferred provider for the WhatsApp API (e.g., Twilio, Meta Business Cloud API)?
> - **Hosting/Database**: For a clinical system, data privacy is paramount. Do you have a preferred hosting provider (Azure, AWS, GCP) or specific compliance needs (like HIPAA-like privacy in your region)?

## Proposed Architecture

### Technical Stack
- **Backend/Logic**: **Python (FastAPI)** - Handles Google Gemini AI, WhatsApp integration, and business logic.
- **Typography**: 
    - `Headings`: **Outfit** or **Plus Jakarta Sans** (Modern Sans-Serif) - Clean, geometric, and "techy".
    - `Accents`: **Lora** (Serif) - Kept only for specific artistic titles to maintain "Elite Clinic" elegance.
    - `Data/Body`: **Inter** - The gold standard for technological readability in data-heavy apps.
- **Database/Auth**: **Supabase** (PostgreSQL + Auth + Storage).
- **Frontend (UI)**: **Next.js (App Router)** - To ensure the "Premium PWA" feel and mobile installation.
- **PWA**: `next-pwa` for mobile capabilities.

## Feature Breakdown

### 1. User Roles & Access Control (via Supabase Auth)
- [x] **Owner (Admin)**: Full global access. Can see statistics, clinical history, and patients for all psychologists.
- [x] **Psychologist**: Access to their own patients' history, statistics, and agenda.
- [x] **Receptionist**: Agenda management and patient registration. *No access to clinical history or global statistics.*

### 2. Patient & Clinical Record (Expediente)
- [x] **Structural Refactor**: Implement `src/features/patients` and `src/features/agenda`.
- [x] **Global Styling Fix**: Centralize Ana López tokens in `globals.css`.
- [x] **Responsive Navigation**: Create a mobile-friendly side drawer.
- **Digital Expediente**: A chronological timeline of notes taken during each session.
- **Note Categorization**: Tags for session type (initial, follow-up, crisis, etc.).
- **Access Control**: Clinical notes are strictly confidential and visible ONLY to the assigned Psychologist and the Owner.
- **Modern App Experience**: 
    - **Soft Glassmorphism**: Reduce border contrast, increase blur (20px+) for a "frosted" high-end feel.
    - **Harmonious Palette**: Use varying tints of the core Bronze for status and data, avoiding harsh black/white contrasts where possible.
    - **Micro-interactions**: Smooth transitions for hover and layout shifts to enhance the "app-like" fluid feel.
- **Transfer Log**: History of patient transfers between psychologists.

### 2.1 Dashboard Redesign (Functional Web App)
- [x] **KPI Cards**: Active patients, appointments, and pending notes.
- [x] **Quick Actions**: Shortcuts for new appointment and patient search.
- [x] **Recent Activity**: Table of recent patients and daily agenda summary.

### 3. Appointment & Agenda System
- Visual calendar for the receptionist and psychologists.
- Appointment status tracking (Scheduled, Completed, Cancelled).
- **Automated WhatsApp reminders** for confirmations.

### 4. Dashboards & Statistics
- Metrics for: Appointments booked, customer retention, growth per therapist.
- Visual charts (using a library like Chart.js or Recharts).

### 5. Automated Communication
- **WhatsApp Templates**: Pre-configured messages for common patient inquiries or follow-ups.

## Proposed Project Structure [NEW]

```text
/psicologIA
  /frontend         # Next.js Application
    /components     # Custom UI Components (Glassmorphism)
    /app            # Pages & Routes
    /public         # PWA Manifest and Icons
  /backend          # FastAPI Application
    /api            # Routes/Endpoints
    /models         # DB Schema
    /services       # WhatsApp & Logic
  /docs             # Requirements & Flowcharts
```

## Verification Plan

### Automated Tests
- Unit tests for Backend logic (pytest).
- Integration tests for WhatsApp reminder triggers.

### Manual Verification
1. **Lighthouse Audit**: Verify PWA scores and mobile responsiveness.
2. **Role Test**: Log in as Receptionist and verify that Stats/Clinical history are inaccessible.
3. **WhatsApp Flow**: Send a test confirmation message and verify reception.
