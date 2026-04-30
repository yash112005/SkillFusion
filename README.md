# 🔗 SkillFusion
> Connecting talent with opportunity through AI-powered skill assessments.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/SkillFusion/SkillFusion/actions)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)

## 📖 Description
SkillFusion is a modern web application designed to evaluate candidate resumes and match them with ideal job roles using AI. 
* ✨ **Smart Parsing**: Automatically extract key skills from uploaded resumes.
* 📊 **Match Scoring**: Get an instant compatibility score for specific roles.
* 🔒 **Secure Auth**: Seamless email and social login via OAuth.
* 📱 **Responsive UI**: A beautiful, dark-mode ready dashboard for all devices.


## 💻 Tech Stack
* **Frontend**: React, Vite, Tailwind CSS , Bootstrap
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Authentication**: JWT, Google/Apple OAuth
* **AI**: Gemini API Integration

## 🎯 Key Highlights
- 🤖 AI-powered resume parsing using Gemini API
- ⚡ Real-time job matching algorithm
- 🔐 Secure JWT + OAuth authentication
- 📱 Fully responsive dark-mode UI

## 🚀 Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SkillFusion/SkillFusion.git
   cd SkillFusion
   ```
2. Install dependencies for both server and client:
   ```bash
   npm run install:all
   ```

## 💡 Usage
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.
3. Upload a sample resume (PDF) to see the parsing and matching in action.

## ⚙️ Configuration
Create a `.env` file in the `server` directory based on the provided `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillfusion
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## 🔌 API Documentation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user and return token |
| `POST` | `/api/resume/parse` | Upload and parse a resume PDF |
| `GET` | `/api/jobs/matches` | Get recommended jobs based on skills |


## 👨‍💻 Author
**Yash Namdeo**
* **GitHub**: [@yash112005](https://github.com/yash112005)
- LinkedIn: [linkedin.com/in/yash-namdeo-48412531a](https://linkedin.com/in/yash-namdeo-48412531a)


## 🤝 Contributing
We welcome contributions! Please follow these steps:
1. Fork the repo and create a new branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes (`git commit -m 'Add amazing feature'`).
3. Push to the branch (`git push origin feature/amazing-feature`).
4. Open a Pull Request.
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements
* [React](https://reactjs.org/) for the UI library.
* [Express](https://expressjs.com/) for the robust backend framework.
* [pdf-parse](https://www.npmjs.com/package/pdf-parse) for extracting text from resumes.

## 💬 Contact & Support
* **Email**: ynamdeo248@gmail.com
* **GitHub**: [@yash112005](https://github.com/yash112005)
- LinkedIn: [linkedin.com/in/yash-namdeo-48412531a](https://linkedin.com/in/yash-namdeo-48412531a)
