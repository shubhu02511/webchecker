require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const bcrypt = require('bcryptjs');
const ChatService = require('./utils/chatUtils');
const User = require('./models/User');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

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
    res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly; Path=/');
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid username or password.' });
    }
  } catch (err) {
    res.render('login', { error: 'Error logging in.' });
  }
});

app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'loggedIn=; HttpOnly; Path=/; Max-Age=0');
  res.redirect('/login');
});

app.get('/', requireAuth, (req, res) => {
  res.render('index', { results: null, error: null, isLoggedIn: true });
});

app.post('/', requireAuth, async (req, res) => {
  const url = req.body.url;

  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    const results = await page.evaluate(() => {
      const issues = [];

      document.querySelectorAll('img:not([alt])').forEach(img => {
        issues.push(`Image without alt: ${img.outerHTML}`);
      });

      document.querySelectorAll('a:not([href])').forEach(a => {
        issues.push(`Link without href: ${a.outerHTML}`);
      });

      document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([placeholder])').forEach(input => {
        issues.push(`Input missing label: ${input.outerHTML}`);
      });

      return issues;
    });

    await browser.close();
    console.log('Accessibility issues:', results);

    res.render('index', { results, error: null });

  } catch (err) {
    console.error('❌ ERROR OCCURRED:', err.message);
    res.render('index', { results: null, error: 'Error analyzing the page.' });
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
  if (!username || !password) {
    return res.render('signup', { error: 'All fields are required.', success: null });
  }
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.render('signup', { error: 'Username already exists.', success: null });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.render('signup', { error: null, success: 'Registration successful! You can now log in.' });
  } catch (err) {
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

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
