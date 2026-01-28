#!/bin/bash
# Render Deployment Verification Script

echo "=================================================="
echo "RODB Website - Render Deployment Verification"
echo "=================================================="
echo ""

# Check Node.js version
echo "1. Checking Node.js setup..."
if grep -q '"node": "18.x"' package.json; then
    echo "   ✓ Node.js version specified: 18.x"
else
    echo "   ✗ Node.js version NOT specified correctly"
fi
echo ""

# Check .env.example exists
echo "2. Checking configuration files..."
if [ -f ".env.example" ]; then
    echo "   ✓ .env.example exists"
else
    echo "   ✗ .env.example NOT found"
fi

if [ -f "render.yaml" ]; then
    echo "   ✓ render.yaml exists"
else
    echo "   ✗ render.yaml NOT found"
fi

if [ -f "RENDER_DEPLOYMENT.md" ]; then
    echo "   ✓ RENDER_DEPLOYMENT.md exists"
else
    echo "   ✗ RENDER_DEPLOYMENT.md NOT found"
fi
echo ""

# Check .env is in .gitignore
echo "3. Checking .gitignore..."
if grep -q "^.env$" .gitignore; then
    echo "   ✓ .env is in .gitignore"
else
    echo "   ✗ .env is NOT in .gitignore"
fi
echo ""

# Check directories exist
echo "4. Checking required directories..."
for dir in "server/data" "server/uploads" "server/logs" "server/backups"; do
    if [ -d "$dir" ]; then
        echo "   ✓ $dir exists"
    else
        echo "   ✗ $dir does NOT exist"
    fi
done
echo ""

# Check app.js has app.listen
echo "5. Checking app.listen configuration..."
if grep -q "app.listen" server/app.js; then
    echo "   ✓ app.listen found in app.js"
else
    echo "   ✗ app.listen NOT found in app.js"
fi
echo ""

# Check package.json start script
echo "6. Checking package.json scripts..."
if grep -q '"start": "node server/app.js"' package.json; then
    echo "   ✓ Start script configured correctly"
else
    echo "   ✗ Start script NOT configured correctly"
fi
echo ""

# Check database.js directory creation
echo "7. Checking database initialization..."
if grep -q "mkdirSync" server/config/database.js; then
    echo "   ✓ Database auto-creates directories"
else
    echo "   ✗ Database initialization might have issues"
fi
echo ""

# Check initDatabase.js exists
echo "8. Checking database schema..."
if [ -f "server/config/initDatabase.js" ]; then
    echo "   ✓ initDatabase.js exists"
else
    echo "   ✗ initDatabase.js NOT found"
fi

if [ -f "server/config/schema.js" ]; then
    echo "   ✓ schema.js exists"
else
    echo "   ✗ schema.js NOT found"
fi
echo ""

# Check essential dependencies
echo "9. Checking dependencies..."
if grep -q '"express"' package.json; then
    echo "   ✓ express is installed"
else
    echo "   ✗ express is NOT installed"
fi

if grep -q '"sqlite3"' package.json; then
    echo "   ✓ sqlite3 is installed"
else
    echo "   ✗ sqlite3 is NOT installed"
fi

if grep -q '"dotenv"' package.json; then
    echo "   ✓ dotenv is installed"
else
    echo "   ✗ dotenv is NOT installed"
fi
echo ""

# Check static files
echo "10. Checking public files..."
if [ -d "server/public/site" ]; then
    echo "   ✓ server/public/site exists"
else
    echo "   ✗ server/public/site does NOT exist"
fi

if [ -d "server/public/admin" ]; then
    echo "   ✓ server/public/admin exists"
else
    echo "   ✗ server/public/admin does NOT exist"
fi
echo ""

echo "=================================================="
echo "Verification Complete!"
echo "=================================================="
echo ""
echo "Next Steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Go to https://render.com"
echo "3. Create Web Service and connect this repository"
echo "4. Set environment variables in Render dashboard"
echo "5. Deploy!"
echo ""
