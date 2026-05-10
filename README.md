# CivicSync: Spoilt Indian Map

CivicSync is a civic-tech platform that empowers citizens to report and track local infrastructure issues (potholes, garbage, etc.) directly to municipal authorities.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for image hosting)
- **Firebase** project (for authentication)

---

## 🛠️ Backend Setup (Server)

The backend is built with Node.js, Express, and Mongoose.

### 1. Install Dependencies
Navigate to the `server` directory and install the required npm packages:
```bash
cd server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory. You can use the following template (fill in your own credentials):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_gmail_for_notifications
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_google_gemini_key

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase Config
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run the Server
You can start the server in development mode (with auto-reload using Nodemon):
```bash
npm run dev
```
The server will be running at `http://localhost:5000`.

### 4. Database Seeding (Optional)
To populate the database with initial sample reports, run:
```bash
node seed.js
```

---

## 🌐 Frontend Setup (Client)

The frontend is built using Vanilla HTML, CSS, and JavaScript. No build step is required.

### 1. Open the App
Simply open `client/public/index.html` in your browser.

### 2. Development Tip
For the best experience (and to ensure API calls work correctly), it is recommended to use a local web server like **Live Server** (VS Code extension).

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/report` | Get all reports |
| `POST` | `/report` | Create a new report (Multipart/form-data) |
| `GET` | `/report/bounds` | Get reports within map bounds |
| `GET` | `/report/nearby` | Check for nearby duplicate reports |
| `PATCH` | `/report/:id/upvote` | Upvote an existing report |
| `PATCH` | `/report/:id/status` | Update report status |
| `GET` | `/api/config` | Returns Firebase config for frontend |

---

## 📂 Project Structure
For a detailed breakdown of the file structure, see [projectStructure.md](./projectStructure.md).
