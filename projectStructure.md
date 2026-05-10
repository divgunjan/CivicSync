# CivicSync Project Structure

This document outlines the directory structure for the **CivicSync (Spoilt Indian Map)** project.

```text
civicisync/
├── client/                        # Frontend (Vanilla JS + HTML)
│   └── public/                    # Web assets
│       ├── dashboard.html         # User Dashboard
│       ├── feedback.html          # Feedback page
│       ├── index.html             # Landing page (Main entry)
│       ├── login.html             # Authentication page
│       ├── social.html            # Community feed
│       ├── step1-details.html     # Pin Location flow
│       ├── step2-details.html     # Issue Details flow
│       ├── step3-review.html      # Review & Submit flow
│       ├── track-issue.html       # Status tracking page
│       ├── javascript/            # Frontend logic
│       │   ├── config.js          # App configuration
│       │   ├── dashboard.js       # Dashboard interactions
│       │   ├── db.js              # Local storage / API helpers
│       │   ├── login.js           # Auth logic
│       │   ├── step1-details.js   # Leaflet map & Pinning logic
│       │   ├── step2-details.js   # Form & Image capture logic
│       │   └── step3-details.js   # PDF generation & Submission
│       └── styles/                # CSS Stylesheets
│           ├── dashboard.css
│           ├── index.css
│           ├── step1-details.css
│           ├── step2-details.css
│           └── step3-details.css
│
├── server/                        # Backend (Node.js + Express)
│   ├── src/
│   │   ├── app.js                 # Entry point & Express setup
│   │   ├── config/                # Configuration (Database, etc.)
│   │   ├── controller/            # Request handlers (Business logic)
│   │   │   └── report.controller.js
│   │   ├── middelware/            # Middleware (Uploads, Auth)
│   │   │   └── upload.middleware.js
│   │   ├── models/                # MongoDB/Mongoose schemas
│   │   │   └── report.model.js
│   │   ├── routes/                # API route definitions
│   │   │   └── report.routes.js
│   │   ├── services/              # External integrations
│   │   │   └── upload.service.js
│   │   └── utils/                 # Utility functions
│   ├── .env                       # Environment variables
│   ├── package.json               # Backend dependencies & scripts
│   ├── seed.js                    # Database seeding script
│   └── uploads/                   # Temporary local image storage
│
├── automation/                    # n8n workflows
│   └── workflows.json
│
├── shared/                        # Shared schemas/constants
│   └── payloads/
│
└── docs/                          # Project Documentation
    ├── api-contract.md
    └── architecture.md
```