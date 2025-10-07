require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const bcrypt = require('bcryptjs');
const ChatService = require('./utils/chatUtils');
const User = require('./models/User');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Helper to parse cookies from request headers
function getCookies(req) {
  const cookies = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      cookies[parts[0].trim()] = decodeURIComponent(parts[1]);
    });
  }
  return cookies;
}

// Auth middleware
function requireAuth(req, res, next) {
  const cookies = getCookies(req);
  if (cookies.loggedIn === 'true') {
    req.isLoggedIn = true;
    next();
  } else {
    res.redirect('/landing');
  }
}

// Landing page route
app.get('/landing', (req, res) => {
  res.render('landing');
});

app.get('/login', (req, res) => {
  const success = req.query.success || null;
  res.render('login', { error: null, success });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  try {
    const user = await User.findOne({ username });
    console.log('User found for login:', user);
    if (user && await bcrypt.compare(password, user.password)) {
      const thirtyDaysInSeconds = 60 * 60 * 24 * 30;
      const cookieAttrs = [`loggedIn=true`, 'HttpOnly', 'Path=/', `Max-Age=${thirtyDaysInSeconds}`];
      if (process.env.NODE_ENV === 'production') {
        cookieAttrs.push('Secure');
        cookieAttrs.push('SameSite=Lax');
      }
      res.setHeader('Set-Cookie', cookieAttrs.join('; '));
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Invalid username or password.', success: null });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Error logging in.', success: null });
  }
});

app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'loggedIn=; HttpOnly; Path=/; Max-Age=0');
  res.redirect('/landing');
});

app.get('/', (req, res) => {
  const cookies = getCookies(req);
  if (cookies.loggedIn === 'true') {
    res.redirect('/dashboard');
  } else {
    res.redirect('/landing');
  }
});

app.get('/domains', requireAuth, (req, res) => {
  res.render('domains', { isLoggedIn: true });
});

app.get('/websites', requireAuth, (req, res) => {
  res.render('websites', { isLoggedIn: true });
});

app.get('/ecommerce', requireAuth, (req, res) => {
  res.render('ecommerce', { isLoggedIn: true });
});

app.get('/hosting', requireAuth, (req, res) => {
  res.render('hosting', { isLoggedIn: true });
});

app.get('/wordpress', requireAuth, (req, res) => {
  res.render('wordpress', { isLoggedIn: true });
});

app.get('/email-office', requireAuth, (req, res) => {
  res.render('email-office', { isLoggedIn: true });
});

app.get('/servers', requireAuth, (req, res) => {
  res.render('servers', { isLoggedIn: true });
});

app.get('/more', requireAuth, (req, res) => {
  res.render('more', { isLoggedIn: true });
});

// Signup routes
app.get('/signup', (req, res) => {
  res.render('signup', { error: null, success: null });
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log('Signup attempt:', { username, password });
  if (!username || !password) {
    return res.render('signup', { error: 'All fields are required.', success: null });
  }
  try {
    const existing = await User.findOne({ username });
    console.log('Existing user:', existing);
    if (existing) {
      return res.render('signup', { error: 'Username already exists.', success: null });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    console.log('User created:', user);
    res.redirect('/login?success=Registration successful! You can now log in.');
  } catch (err) {
    console.error('Signup error:', err);
    res.render('signup', { error: 'Error creating user.', success: null });
  }
});

const chatService = new ChatService();

app.post('/api/chat', express.json(), async (req, res) => {
  const { message, sessionId = 'default' } = req.body;
  try {
    const result = await chatService.processMessage(message, sessionId);
    res.json({ reply: result.reply });
  } catch (err) {
    res.status(500).json({ reply: err.message || 'Sorry, there was an error.' });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.render('index', { results: null, error: null, isLoggedIn: true, chartData: null, solutions: null });
});

app.post('/dashboard', requireAuth, async (req, res) => {
  const inputUrl = req.body.url || '';
  const url = /^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`;

  try {
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1366,768',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    };
    if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }
    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    const analysis = await page.evaluate(() => {
      // Count all elements
      const totalImgs = document.querySelectorAll('img').length;
      const totalLinks = document.querySelectorAll('a').length;
      const totalInputs = document.querySelectorAll('input').length;

      // Count issues
      const imgWithoutAlt = document.querySelectorAll('img:not([alt])').length;
      const linkWithoutHref = document.querySelectorAll('a:not([href])').length;
      const inputMissingLabel = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([placeholder])').length;

      // Calculate percentages
      const imgPercent = totalImgs ? Math.round((imgWithoutAlt / totalImgs) * 100) : 0;
      const linkPercent = totalLinks ? Math.round((linkWithoutHref / totalLinks) * 100) : 0;
      const inputPercent = totalInputs ? Math.round((inputMissingLabel / totalInputs) * 100) : 0;

      // Prepare issues/solutions (only once per type)
      const issues = [];
      const solutions = [];
      if (imgWithoutAlt > 0) {
        issues.push(`Some images are missing descriptions (${imgPercent}%)`);
        solutions.push('Add a short description (alt text) to every image so everyone can understand what the image shows.');
      }
      if (linkWithoutHref > 0) {
        issues.push(`Some links don't go anywhere (${linkPercent}%)`);
        solutions.push('Make sure every link takes people to the right place by adding a web address (href).');
      }
      if (inputMissingLabel > 0) {
        issues.push(`Some form boxes are missing names or instructions (${inputPercent}%)`);
        solutions.push('Add a clear label or instruction to every form box so people know what to type.');
      }
      return {
        issues,
        solutions,
        chartData: [
          { label: 'Images missing descriptions', percent: imgPercent },
          { label: 'Links without destination', percent: linkPercent },
          { label: 'Form boxes missing labels', percent: inputPercent }
        ]
      };
    });

    await browser.close();
    console.log('Accessibility issues:', analysis.issues);

    res.render('index', { results: analysis.issues, solutions: analysis.solutions, chartData: analysis.chartData, error: null, isLoggedIn: true });

  } catch (err) {
    console.error('❌ ERROR OCCURRED:', err.message);
    res.render('index', { results: null, solutions: null, chartData: null, error: 'Error analyzing the page.', isLoggedIn: true });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

module.exports = app;
