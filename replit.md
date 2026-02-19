# Student Council (สภานักเรียน)

## Overview
A Thai language Student Council web application - a single-page application built with HTML, Tailwind CSS, and JavaScript. Uses Firebase for authentication and data storage.

## Project Structure
- `index.html` - Main application file containing HTML and JavaScript
- `css/styles.css` - Extracted CSS styles for faster loading

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
- User and Admin Manual system (separate `manual.html` file)

## Recent Changes (February 19, 2026)
- Added `manual.html` containing General User Manual and Admin Manual.
- Integrated manual links into `index.html`:
  - Added "คู่มือการใช้งาน" (Manual) link in User Profile section.
  - Added "คู่มือ Admin" (Admin Manual) link in Admin Panel section.
- Admin manual is accessible via `manual.html?mode=admin`.

## Recent Changes (January 31, 2026)
- Renamed system to "ระบบดิจิทัล ส.ท." (S.T. Digital System)
- Added credit text on login page: "จัดทำโดยพรรคส.ท.ก้าวหน้า และคณะกรรมการนักเรียน"
- Added Discord notification for morning check-in with user name, ID, and time.
- Improved QR code quality (Level H error correction, 512px size) to fix scanning issues for permanent/downloaded QR codes.
- Extended morning check-in time to 06:00 - 08:00 น. for better usability.
- Added reward redemption system for waste bank activity
  - Admin can add rewards with name, description, image link, required points, and stock quantity
  - Admin can delete rewards
  - Users can view available rewards in waste bank tab
  - Users can redeem rewards using their waste bank stamps
  - Discord notification sent when rewards are redeemed

## Previous Changes (January 30, 2026)
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
