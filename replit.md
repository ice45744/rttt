# Student Council (สภานักเรียน)

## Overview
A Thai language Student Council web application - a single-page application built with HTML, Tailwind CSS, and JavaScript. Uses Firebase for authentication and data storage.

## Project Structure
- `index.html` - Main application file containing all HTML, CSS, and JavaScript

## Technologies
- HTML5
- Tailwind CSS (via CDN)
- Font Awesome icons
- SweetAlert2 for dialogs
- QR code generation and scanning libraries
- Firebase (Authentication + Firestore)

## Features
- User registration and login (with Admin role via secret code)
- Announcements with optional image links (Admin can create and delete)
- Good deeds submission and Admin approval with custom point scoring
- Problem reporting by users and Admin management with delete option
- Morning check-in via QR code scanning
- Waste bank stamp collection system

## Recent Changes (January 30, 2026)
- Added score input field for Admin to enter custom points when approving good deeds
- Added problem reports section in Admin panel with delete functionality
- Added optional image link field for announcements
- Added delete button for announcements (Admin only)

## Running Locally
The project is served using Python's built-in HTTP server on port 5000:
```
python -m http.server 5000 --bind 0.0.0.0
```

## Deployment
Configured as a static site deployment serving the root directory.
