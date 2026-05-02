spoilt-indian-map/
│
├── client/                        # Frontend (UI + Map)
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── Map.js
│   │   │   │   └── mapUtils.js
│   │   │   │
│   │   │   ├── ReportForm/
│   │   │   │   ├── ReportForm.js
│   │   │   │   └── ImageUpload.js
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── Button.js
│   │   │       └── Loader.js
│   │   │
│   │   ├── pages/
│   │   │   └── Home.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js          # talks to backend
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── utils/
│   │   │   └── constants.js
│   │   │
│   │   └── App.js
│   │
│   └── package.json
│
├── server/                        # Backend (Core API) ← YOU
│   ├── src/
│   │   ├── routes/
│   │   │   └── report.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   └── report.controller.js
│   │   │
│   │   ├── models/
│   │   │   └── report.model.js
│   │   │
│   │   ├── services/
│   │   │   ├── upload.service.js
│   │   │   └── webhook.service.js
│   │   │
│   │   ├── middleware/
│   │   │   └── upload.middleware.js
│   │   │
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── utils/
│   │   │   └── logger.js
│   │   │
│   │   └── app.js
│   │
│   ├── .env
│   └── package.json
│
├── automation/                    # n8n workflows ← Person 4
│   ├── workflows.json
│   └── README.md
│
├── shared/                        # Contract between backend + n8n
│   └── payloads/
│       └── report.schema.json
│
├── docs/                          # Team reference (VERY IMPORTANT)
│   ├── api-contract.md
│   ├── db-schema.md
│   ├── architecture.md
│   └── setup.md
│
├── .gitignore
├── README.md