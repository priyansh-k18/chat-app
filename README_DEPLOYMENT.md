# 🚀 Chat App - Deployment Guide

## 📁 Project Structure
```
chatApp/
├── client/          # Frontend React app
├── server/          # Backend Node.js server
└── DEPLOYMENT_CHECKLIST.md
```

## 🔧 What's Been Updated

### Backend (server/)
- ✅ Fixed Vercel deployment configuration
- ✅ Added root route to prevent 404 errors
- ✅ Improved database connection handling
- ✅ Enhanced error handling and logging
- ✅ Updated CORS configuration for production

### Frontend (client/)
- ✅ Created centralized config file
- ✅ Updated backend URL configuration
- ✅ Fixed import paths
- ✅ Centralized API endpoints

## 🚀 Quick Start

### 1. Backend Deployment
```bash
cd server
vercel --prod
```

### 2. Set Environment Variables in Vercel
Go to your Vercel dashboard and add:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_*` variables
- `CORS_ORIGINS`

### 3. Test Backend
Visit your backend URL to see the server info:
```
https://your-backend.vercel.app/
```

### 4. Frontend Development
```bash
cd client
npm run dev
```

## 🔗 Important URLs

### Backend Endpoints:
- **Root**: `/` - Server information
- **Status**: `/api/status` - Health check
- **Auth**: `/api/auth/*` - Authentication routes
- **Messages**: `/api/messages/*` - Chat functionality

### Frontend Routes:
- **Home**: `/` - Main chat interface
- **Login**: `/login` - Authentication
- **Profile**: `/profile` - User settings

## 📱 Features

- ✅ Real-time chat with Socket.IO
- ✅ User authentication (JWT)
- ✅ Image sharing via Cloudinary
- ✅ Online user status
- ✅ Message history
- ✅ Profile management

## 🛠️ Tech Stack

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO for real-time
- JWT authentication
- Cloudinary for images

### Frontend:
- React 19
- Tailwind CSS
- React Router
- Axios for API calls
- Socket.IO client

## 🚨 Troubleshooting

### Common Issues:
1. **"Not Found" Error**: Backend needs root route ✅
2. **Database Connection**: Check MongoDB URI format
3. **CORS Issues**: Verify CORS_ORIGINS setting
4. **Socket.IO**: Ensure backend URL is correct

### Debug Steps:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test endpoints individually
4. Check browser console for errors

## 📞 Support
- Check `DEPLOYMENT_CHECKLIST.md` for detailed steps
- Review Vercel deployment logs
- Test each endpoint separately
- Verify all environment variables are set
