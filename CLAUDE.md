# Gaurav's ShopMart — Project Context

## App Overview
Full stack e-commerce platform called "Gaurav's ShopMart"

## Tech Stack
- Frontend: Angular (in /frontend folder)
- Backend: Python FastAPI (in /backend folder)
- Database: Azure SQL Database
- Hosting: Azure Static Web Apps (frontend) + 
  Azure App Service (backend)
- CI/CD: GitHub Actions

## Live URLs
- Frontend: https://black-meadow-05d967c0f.7.azurestaticapps.net
- Backend: https://product-catalog-api-gaurav-f4ara9gadha3hybf.centralus-01.azurewebsites.net
- GitHub: https://github.com/sgauravdixit/product-catalog

## Design System (STRICTLY FOLLOW)

### Colors
- Background: #F5F0E8 (warm cream/beige)
- Card Yellow: #F0E6C8 (warm sand)
- Card Green: #C8E6D4 (soft mint)
- Card Pink: #F0C8C8 (soft blush)
- Header/Footer: #000000 (pure black)
- Primary Text: #1A1A1A (near black)
- Body Text: #333333 (dark gray)
- Accent/Highlight: #F5E642 (warm yellow)
- Icon buttons: White with 1px border
- Number badges: Black circle with white text

### Typography
- Headings: Bold, black, large
- Body: Regular weight, dark gray
- Style: Editorial, clean, minimal

### Component Style
- Cards: Soft pastel fills, rounded corners (12px)
- No gradients anywhere
- No shadows (or very subtle)
- Flat solid colors only
- Clean minimal spacing
- Rounded buttons with black border

### Layout
- Warm cream background on all pages
- Black header with white logo text
- Black footer
- Cards in alternating pastel colors 
  (yellow, green, pink)
- Bold section numbers in black circles

## Pages
- / → Landing page (public)
- /login → Login page (public)
- /register → Register page (public)
- /home → Products listing (protected)
- /product/:id → Product detail (protected)
- /cart → Cart page (protected)
- /profile → User profile (protected)

## Features to Build
- [ ] User registration and login (JWT auth)
- [ ] 100 products from Azure SQL database
- [ ] Category filtering
- [ ] Product detail slider/drawer
- [ ] Persistent cart across sessions
- [ ] User profile page
- [ ] Place order flow
- [ ] No Stripe for now

## Database Tables
- Users, Products, Categories, Cart,
  Cart_Items, Orders, Order_Items

## Coding Rules
- Always use Angular services for API calls
- Always use environment files for API URLs
- Never hardcode URLs
- Always handle loading and error states
- Always push to GitHub after changes
- Backend: always add CORS for frontend URL
- Use async/await in Python backend
- STRICTLY follow the design system above
- Product cards alternate between 
  yellow, green and pink pastel colors
- Never use purple or blue — 
  this is a warm pastel design system

## Current Status
- Frontend deployed on Azure Static Web Apps ✅
- Backend deployed on Azure App Service ✅
- In-memory data (no real DB yet)
- Basic product catalog working ✅
