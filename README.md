# Filer Backend

## Overview
Filer Backend is a powerful and scalable backend service for handling file storage, management, and retrieval. It supports secure XML file uploads, parsing to extract custom data, and advanced authentication features. Built with Node.js, Express, and MongoDB, it ensures efficient data processing and seamless integration with frontend applications. The backend is hosted on Render for easy deployment and scalability.

## Features
- Secure file upload and storage
- XML file parsing to extract custom information
- File metadata management
- User authentication and authorization using bcrypt and JWT
- RESTful API for file operations
- Hosted on Render

## Technologies Used
- **Node.js**: Backend runtime environment
- **Express.js**: Web framework for handling API requests
- **MongoDB Atlas**: Cloud-based NoSQL database for storing file metadata
- **Multer**: Middleware for handling file uploads
- **JWT Authentication**: Secure user authentication with bcrypt

## Installation
### Prerequisites
Make sure you have the following installed:
- Node.js (v16 or later)
- MongoDB Atlas (or a local MongoDB instance)

### Steps to Set Up
1. Clone the repository:
   ```sh
   git clone https://github.com/ayushman075/filer-backend.git
   cd filer-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and configure the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_atlas_uri
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```sh
   node index.js
   ```
   The server will be running on `http://localhost:5000`

## API Endpoints
### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/getcurrentuser` - Get the currently authenticated user

### File Management
- `GET /api/files/getAll` - Retrieve all files
- `GET /api/files/getById/:id` - Retrieve a file by ID
- `POST /api/files/upload/xml` - Upload and parse an XML file
- `PUT /api/files/update/:id` - Update file metadata
- `DELETE /api/files/delete/:id` - Delete a file
- `GET /api/files/getAnalytics` - Get analytics from stored data

## Deployment
The backend is hosted on Render. To deploy your own instance, consider using:
- Render
- AWS EC2
- Heroku
- DigitalOcean
- Railway

## Contact
For any queries or issues, reach out at ayushman8521@gmail.com .
