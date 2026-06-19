# CreditLens

> ML-powered credit risk assessment platform for fintech analytics.

## Overview

CreditLens analyzes applicant financial data and predicts credit default risk using a machine learning pipeline trained on 150,000 real credit records.

* **Default probability** — XGBoost model (ROC-AUC 0.87)
* **Risk category** — Low / Medium / High / Critical
* **Key risk drivers** — per-prediction SHAP waterfall chart
* **Business recommendation** — Approve / Review / Reject
* **PDF report** — downloadable per-applicant risk summary

## Live Demo

Frontend (Vercel): https://creditlens-three.vercel.app/

> Demo mode is enabled — no login required.
> Backend API is hosted separately on Render.

## Backend API

FastAPI Service (Render): https://creditlens-api-ytv1.onrender.com


## Features

| Feature                | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| Applicant Prediction   | 10-field form → risk score, probability, and SHAP explanation    |
| SHAP Waterfall Chart   | Top 5 local feature contributions per applicant                  |
| Analytics Dashboard    | Portfolio KPIs, risk distribution, and global feature importance |
| Model Performance Page | ROC-AUC, confusion matrix, ROC curve, and global SHAP            |
| PDF Reports            | Downloadable per-applicant risk summary                          |
| Demo Mode              | Full platform access without login                               |
| Dark / Light Mode      | Theme toggle with next-themes                                    |

## Tech Stack

**Frontend:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Framer Motion

**Backend:** FastAPI · XGBoost · SHAP (TreeExplainer) · scikit-learn · pandas · Pydantic v2

**Infrastructure:** Supabase (Auth + PostgreSQL + RLS) · Vercel · Render 


## ML Model

| Property        | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| Algorithm       | XGBoost (n_estimators=300, max_depth=4)                            |
| Dataset         | Give Me Some Credit — 150,000 credit records                       |
| Target          | 90-day delinquency within 2 years                                  |
| ROC-AUC         | **0.8686**                                                         |
| Precision       | 0.2171                                                             |
| Recall          | 0.7791                                                             |
| F1              | 0.3395                                                             |
| Class Imbalance | scale_pos_weight = 13.96                                           |
| Preprocessing   | Median imputation → 99th percentile winsorization → StandardScaler |

**Top SHAP Features**

* Credit Utilization (0.845)
* 30–59 Day Late Payments (0.391)
* 90+ Day Late Payments (0.335)


## Local Setup

### Prerequisites

* Node.js 20+
* Python 3.11+
* Supabase project (free tier)

### Clone Repository

```bash
git clone https://github.com/Backstreet-05/creditlens.git
cd creditlens
```

### Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Configure environment variables

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

cp .env.example .env.local
# Configure environment variables

npm run dev
```

### Supabase

1. Create a Supabase project.
2. Run `docs/supabase-schema.sql` in the SQL Editor.
3. Add your project credentials to `frontend/.env.local`.

The application will be available at:

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:8000`

## Project Structure

```text
creditlens/
├── frontend/     # Next.js 16 App Router
├── backend/      # FastAPI + ML pipeline
│   └── ml/
│       ├── artifacts/   # Model files
│       └── notebooks/   # EDA → training → evaluation
└── docs/         # Supabase schema SQL
```

## Demo Applicants

Three pre-seeded profiles for demo mode:

| Name            | Risk     | Score | Key Factor                               |
| --------------- | -------- | ----- | ---------------------------------------- |
| Sarah Chen      | Low      | ~12   | Utilization 0.12, clean history          |
| Marcus Johnson  | Medium   | ~38   | Utilization 0.42, 1 late payment         |
| David Rodriguez | Critical | ~97   | Utilization 0.91, multiple delinquencies |

## Dataset Attribution

**Give Me Some Credit** — Kaggle Competition

[Give Me Some Credit (Kaggle Competition)](https://www.kaggle.com/c/GiveMeSomeCredit)

> Used for educational and portfolio demonstration purposes only. No real lending decisions are made.
