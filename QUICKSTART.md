# Quick Start Guide - Medical Accounting System in Chrome

## Prerequisites
You need to install **Node.js** first. This includes npm (Node Package Manager).

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version
3. Install it on your computer
4. Verify installation by opening Command Prompt/Terminal and typing:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers.

## Setup & Run in Chrome

### Step 2: Download/Clone the Project

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/azlansid2056-tech/medical-accounting-system.git
cd medical-accounting-system
```

**Option B: Download as ZIP**
1. Go to https://github.com/azlansid2056-tech/medical-accounting-system
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open Command Prompt/Terminal
5. Navigate to the folder:
   ```bash
   cd path/to/medical-accounting-system
   ```

### Step 3: Install Dependencies
```bash
npm install
```
This will download all required packages (takes 2-3 minutes).

### Step 4: Start the Development Server
```bash
npm run dev
```

You'll see output like:
```
VITE v5.4.10  ready in 123 ms

➜  Local:   http://localhost:3000/
➜  press h + enter to show help
```

### Step 5: Open in Chrome
1. Copy the URL: `http://localhost:3000`
2. Open **Google Chrome**
3. Paste the URL in the address bar
4. Press Enter

**The app should now be running in Chrome!**

---

## Troubleshooting

### Issue: "npm: command not found"
**Solution:** Node.js is not installed. Go back to Step 1 and install Node.js.

### Issue: Port 3000 is already in use
**Solution:** Run on a different port:
```bash
npm run dev -- --port 3001
```
Then open `http://localhost:3001`

### Issue: "Cannot find module dependencies"
**Solution:** Run again:
```bash
npm install
```

### Issue: Nothing appears in Chrome
1. Check the terminal - are there any red error messages?
2. Try pressing Ctrl+Shift+R (hard refresh) in Chrome
3. Open Developer Tools (F12) and check Console tab for errors

---

## What You Can Do

Once the app opens:

✅ **Products Tab**
- Add medicines from the pre-loaded list
- Auto-generate product codes
- Set rack locations
- Track inventory

✅ **Suppliers Tab**
- Register suppliers
- Store contact info
- Track payments

✅ **Customers Tab**
- Add customer details
- Track ledger

✅ **Purchases Tab**
- Create purchase bills
- Add batch and expiry
- Set Nepali & AD dates
- Track payment due (30/60/90/120 days)

✅ **Sales Tab**
- Create sales invoices
- Apply discounts (% or amount)
- Track customer payments

✅ **Accounting Tab**
- Track expenses with custom categories
- Record income
- Manage supplier payments

✅ **Reports Tab**
- View sales and purchase reports
- Filter by time (Today, Yesterday, Week, Month, Year)
- Print ledgers
- View Profit & Loss

---

## Build for Production

To create a production build (optimized for deployment):
```bash
npm run build
```

This creates a `dist/` folder with the compiled app.

---

## Next Steps

If you want to:
- Deploy it online (Vercel, Netlify, Firebase)
- Add a backend database
- Create a mobile app version
- Add more features

Let me know!

---

## Need Help?

If you still have issues:
1. Share the exact error message you see
2. Tell me which step you're stuck on
3. Let me know your operating system (Windows/Mac/Linux)

I can help debug it!
