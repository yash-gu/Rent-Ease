#!/bin/bash

echo "Setting up RentEase MERN Stack Application"
echo "=========================================="

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start MongoDB (if not already running)"
echo "2. In one terminal: cd backend && npm run dev"
echo "3. In another terminal: cd frontend && npm start"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000/api"