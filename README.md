# shaupex (MERN, Cash on Delivery)

Zaroori: Node.js 18+ aur local MongoDB (mongodb://127.0.0.1:27017)

## Chalane ka tareeqa (2 terminal)

Terminal 1 - Backend
    cd backend
    npm install
    npm run dev

Terminal 2 - Frontend
    cd frontend
    npm install
    npm run dev

Browser: http://localhost:5173

## Admin login (server pehli dafa chalne par khud banata hai)
Email: admin@shop.com
Password: admin123

## backend/.env me kya kya hai
- DB_MODE=local   -> abhi local MongoDB. Atlas par jane ke liye DB_MODE=atlas karo
                     aur MONGO_URI_ATLAS me apna cluster link daalo.
- CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET -> teeno bharo, to product photos Cloudinary me jayengi.
                     Khali ho to photos backend/uploads me save hoti hain.
- JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

## Admin panel
Dashboard, Products (discount % ke saath), Categories, Orders, Coupons,
Delivery settings (delivery charges + free delivery limit), Messages (contact form).
