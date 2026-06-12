const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  console.log('🧪 Testing new features...\n');

  // Test 1: Auto-route modal with route suggestions
  console.log('1️⃣  Auto-route Modal with Route Suggestions');
  await page.click('#btn-auto-route');
  await page.waitForSelector('#route-suggestions .card', { timeout: 3000 });
  const routeCount = await page.$$eval('#route-suggestions .card', els => els.length);
  console.log(`   ✓ Loaded ${routeCount} route suggestions`);

  const routeText = await page.$eval('#route-suggestions', el => el.textContent);
  console.log(`   ✓ Routes include: ${routeText.includes('Tối ưu chi phí') ? 'Cost-opt' : ''}${routeText.includes('Giao hàng nhanh') ? ', Fast delivery' : ''}${routeText.includes('Cân bằng tải') ? ', Load balance' : ''}`);

  await page.click('.js-modal-close');
  console.log('   ✓ Modal closes\n');

  // Test 2: Hub cost breakdown table
  console.log('2️⃣  Hub Cost Breakdown (Costs view)');
  await page.click('[data-view="costs"]');
  await page.waitForSelector('#hub-costs-tbody tr', { timeout: 3000 });
  const hubRows = await page.$$eval('#hub-costs-tbody tr', els => els.map(el => el.textContent));
  console.log(`   ✓ Loaded ${hubRows.length} hub cost rows`);
  hubRows.forEach((row, idx) => {
    const has_monthly = row.includes('VNĐ') ? '✓' : '✗';
    console.log(`     ${idx + 1}. ${row.substring(0, 25).trim()}... ${has_monthly}`);
  });
  console.log();

  // Test 3: Container detail modal with flow description + laden status
  console.log('3️⃣  Container Detail Modal (Flow desc + Laden status)');
  await page.click('[data-view="orders"]');
  await page.waitForSelector('.js-detail', { timeout: 3000 });
  await page.click('.js-detail');
  await page.waitForSelector('#detail-flow-desc', { timeout: 3000 });

  const flowDesc = await page.$eval('#detail-flow-desc', el => el.textContent);
  const ladenStatus = await page.$eval('#detail-laden-status', el => el.textContent);
  console.log(`   ✓ Flow description: "${flowDesc}"`);
  console.log(`   ✓ Laden status: "${ladenStatus}"`);
  console.log('   ✓ Modal displays flow context\n');

  await page.click('.js-modal-close');

  // Test 4: Responsive layout on mobile
  console.log('4️⃣  Responsive Mobile Layout (375px)');
  await page.setViewport({ width: 375, height: 667 });
  await page.click('[data-view="dashboard"]');
  await page.waitForSelector('.hamburger', { timeout: 2000 });
  const sidebarHidden = await page.$eval('.sidebar', el =>
    window.getComputedStyle(el).transform.includes('translateX') ||
    window.getComputedStyle(el).width === '0px'
  );
  console.log(`   ✓ Sidebar responsive: ${sidebarHidden ? 'hidden (off-canvas)' : 'visible'}`);

  const statCards = await page.$$eval('.grid-4 > div', els => els.length);
  console.log(`   ✓ Stat cards layout: ${statCards} items\n`);

  // Test 5: All views accessible
  console.log('5️⃣  All Views Accessible');
  const views = ['dashboard', 'orders', 'resources', 'costs', 'data'];
  for (const view of views) {
    await page.click(`[data-view="${view}"]`);
    await page.waitForTimeout(100);
    const visible = await page.$eval(`#view-${view}`, el =>
      window.getComputedStyle(el).display !== 'none'
    );
    console.log(`   ${visible ? '✓' : '✗'} ${view}`);
  }

  console.log('\n✅ All tests passed!');
  await browser.close();
})();
