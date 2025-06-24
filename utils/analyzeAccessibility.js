const puppeteer = require('puppeteer');
const axeCore = require('axe-core');

async function analyzeAccessibility(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to:", url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Inject axe-core script
    await page.addScriptTag({ path: require.resolve('axe-core') });

    console.log("🔍 Running accessibility checks...");

    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    await browser.close();

    const issues = results.violations.map(v => v.description);
    return issues;

  } catch (error) {
    console.error("❌ ERROR OCCURRED:", error.message);
    await browser.close();
    return [`Error analyzing page: ${error.message}`];
  }
}

module.exports = analyzeAccessibility;
// Usage example:
// analyzeAccessibility('https://example.com')  