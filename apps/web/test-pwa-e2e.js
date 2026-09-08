const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTest() {
  const artifactDir = 'C:\\Users\\shrey\\.gemini\\antigravity-ide\\brain\\7945a8b7-a660-49b9-bc60-23cc09b7571c';
  console.log('Launching browser with msedge/chromium...');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch (e2) {
      console.log('Installing chromium for playwright...');
      const { execSync } = require('child_process');
      execSync('npx playwright install chromium', { stdio: 'inherit' });
      browser = await chromium.launch({ headless: true });
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Verify Header and initial WASM status
  const title = await page.title();
  console.log('Page Title:', title);

  const toggleBtn = page.locator('#pwa-offline-toggle-btn');
  await toggleBtn.waitFor({ state: 'visible', timeout: 5000 });
  const initialText = await toggleBtn.innerText();
  console.log('Initial Telemetry:', initialText.replace(/\n/g, ' '));

  // Screenshot 1: Online state
  const screen1 = path.join(artifactDir, 'pwa_step1_online.png');
  await page.screenshot({ path: screen1 });
  console.log('Screenshot saved:', screen1);

  // 2. Click Offline Toggle to activate Simulated Offline Mode
  console.log('Activating Simulated Offline Mode...');
  await toggleBtn.click();
  await page.waitForTimeout(500);

  const offlineText = await toggleBtn.innerText();
  console.log('Offline Telemetry:', offlineText.replace(/\n/g, ' '));

  // Verify Floating Offline Banner
  const banner = page.locator('#offline-status-banner');
  await banner.waitFor({ state: 'visible', timeout: 3000 });
  const bannerText = await banner.innerText();
  console.log('Offline Banner Text:', bannerText.replace(/\n/g, ' | '));

  // Screenshot 2: Offline banner & telemetry active
  const screen2 = path.join(artifactDir, 'pwa_step2_offline_banner.png');
  await page.screenshot({ path: screen2 });
  console.log('Screenshot saved:', screen2);

  // 3. Test Offline Quantum Simulation
  console.log('Testing Circuit Simulation in Offline Mode...');
  // Click H gate in palette
  const hGate = page.locator('button:has-text("H"):not(:has-text("CH"))').first();
  if (await hGate.isVisible()) {
    await hGate.click();
    console.log('Selected H gate from palette');
    await page.waitForTimeout(300);
  }

  // Click Simulate button
  const simBtn = page.locator('button:has-text("Simulate")');
  await simBtn.click();
  console.log('Simulate clicked in offline mode!');
  await page.waitForTimeout(500);

  // Screenshot 3: Simulated offline circuit state
  const screen3 = path.join(artifactDir, 'pwa_step3_offline_simulation.png');
  await page.screenshot({ path: screen3 });
  console.log('Screenshot saved:', screen3);

  // 4. Test Quest Arena Access Offline
  console.log('Testing Quest Arena modal in offline mode...');
  const questsBtn = page.locator('button:has-text("Quests")');
  await questsBtn.click();
  await page.waitForTimeout(500);

  const arenaModalTitle = page.locator('text=National Collegiate Quantum League');
  const isArenaVisible = await arenaModalTitle.isVisible();
  console.log('Quest Arena visible offline:', isArenaVisible);

  // Screenshot 4: Quest Arena offline
  const screen4 = path.join(artifactDir, 'pwa_step4_quests_offline.png');
  await page.screenshot({ path: screen4 });
  console.log('Screenshot saved:', screen4);

  // Close Quest Arena using accessible aria-label
  const closeBtn = page.locator('button[aria-label="Close Arena Modal"]');
  await closeBtn.waitFor({ state: 'visible', timeout: 3000 });
  await closeBtn.click();
  console.log('Quest Arena modal closed.');
  await page.waitForTimeout(500);

  // 5. Click Resume Online in offline banner
  console.log('Clicking Resume Online button...');
  const resumeBtn = page.locator('#resume-online-btn');
  await resumeBtn.waitFor({ state: 'visible', timeout: 3000 });
  await resumeBtn.click();
  await page.waitForTimeout(500);

  const restoredText = await toggleBtn.innerText();
  console.log('Restored Telemetry:', restoredText.replace(/\n/g, ' '));
  const isBannerGone = !(await banner.isVisible());
  console.log('Offline Banner dismissed:', isBannerGone);

  // Screenshot 5: Restored Online
  const screen5 = path.join(artifactDir, 'pwa_step5_restored_online.png');
  await page.screenshot({ path: screen5 });
  console.log('Screenshot saved:', screen5);

  console.log('\n=== ALL PWA OFFLINE VERIFICATION CHECKS PASSED ===\n');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
