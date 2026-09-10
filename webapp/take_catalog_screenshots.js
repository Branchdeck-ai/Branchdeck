const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const artifactDir = 'C:\\Users\\adel\\.gemini\\antigravity-ide\\brain\\8d7f3f92-c094-479d-bdd9-2aa597982565';
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/onboarding...');
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
  
  // Take screenshot of Onboarding
  const onboardingPath = path.join(artifactDir, 'catalog_onboarding_step2.png');
  await page.screenshot({ path: onboardingPath, fullPage: true });
  console.log('Saved onboarding screenshot to:', onboardingPath);

  console.log('Navigating to http://localhost:3000/dashboard/store...');
  await page.goto('http://localhost:3000/dashboard/store', { waitUntil: 'networkidle' });
  
  // Take screenshot of Dashboard Store
  const storePath = path.join(artifactDir, 'catalog_dashboard_store.png');
  await page.screenshot({ path: storePath, fullPage: true });
  console.log('Saved dashboard store screenshot to:', storePath);

  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
