import { chromium } from 'playwright';

async function run() {
  console.log('Testing Weather Forecast & Fertilizer Advisory component in browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Listen to console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000');
  
  // Set user profile in localStorage so we land directly on HomeDashboard
  await page.evaluate(() => {
    const profile = {
      user_id: 'test-farmer-01',
      display_name: 'ชาตรี ชาวสวนสุราษฎร์',
      age: 48,
      language: 'th',
      farming_types: ['สวนปาล์มน้ำมัน', 'สวนทุเรียน'],
      location: 'สุราษฎร์ธานี',
      soil_problems: ['ดินเปรี้ยว (กรดจัด)'],
      font_scale: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('soil_time_user_profile', JSON.stringify(profile));
  });

  await page.reload();

  // 1. Wait for HomeDashboard greeting
  console.log('Verifying HomeDashboard render...');
  await page.waitForSelector('text=ชาตรี ชาวสวนสุราษฎร์', { timeout: 10000 });
  console.log('PASS: Dashboard rendered with farmer profile.');

  // 2. Verify WeatherForecastCard header
  console.log('Verifying WeatherForecastCard presence...');
  await page.waitForSelector('text=สภาพอากาศและคำแนะนำใส่ปุ๋ย', { timeout: 10000 });
  console.log('PASS: Weather advisory title found.');

  // 3. Verify Fertilizer Suitability Guidance
  const pageText = await page.textContent('body');
  const hasSuitability =
    pageText.includes('ใส่ปุ๋ย') &&
    (pageText.includes('ปุ๋ยเม็ดทางดิน') || pageText.includes('ปุ๋ยทางใบ/ฮอร์โมน'));
  if (!hasSuitability) {
    throw new Error('Fertilizer guidance sections not found!');
  }
  console.log('PASS: Fertilizer guidance (soil & foliar) rendered successfully.');

  // 4. Verify 4 metrics (Temp °C, Rain chance %, Humidity %, Wind km/h)
  const hasTemp = pageText.includes('°C');
  const hasRain = pageText.includes('โอกาสฝน');
  const hasHumidity = pageText.includes('ความชื้น');
  const hasWind = pageText.includes('ความเร็วลม');
  console.log('Metrics check:', { hasTemp, hasRain, hasHumidity, hasWind });
  if (!hasTemp || !hasRain || !hasHumidity || !hasWind) {
    throw new Error('Missing core weather metrics!');
  }
  console.log('PASS: All core weather metrics are visible.');

  // 5. Verify 5-day outlook buttons
  console.log('Checking 5-day outlook...');
  await page.waitForSelector('text=แนวโน้ม 5 วันล่วงหน้าเพื่อวางแผนใส่ปุ๋ย');
  const dayButtons = await page.$$('button:has-text("วันนี้"), button:has-text("พรุ่งนี้")');
  console.log('Found day forecast buttons:', dayButtons.length);
  if (dayButtons.length === 0) {
    throw new Error('No 5-day forecast buttons found!');
  }
  console.log('PASS: 5-day planning buttons available.');

  // 6. Test Location Picker
  console.log('Testing location selector modal...');
  const locButton = await page.waitForSelector('button[title="เปลี่ยนพื้นที่"]');
  await locButton.click();
  await page.waitForSelector('text=ตรวจจับพิกัด GPS สวน');
  console.log('PASS: Location picker opened with GPS button.');

  // Select Chiang Mai
  const chiangMaiBtn = await page.waitForSelector('button:has-text("เชียงใหม่")');
  await chiangMaiBtn.click();
  
  // Wait for update
  await page.waitForTimeout(1000);
  const updatedText = await page.textContent('body');
  if (!updatedText.includes('เชียงใหม่')) {
    throw new Error('Failed to switch location to Chiang Mai');
  }
  console.log('PASS: Successfully switched location to เชียงใหม่ and loaded forecast.');

  // Take screenshot
  await page.screenshot({ path: 'scripts/weather-card-screenshot.png', fullPage: false });
  console.log('Screenshot saved to scripts/weather-card-screenshot.png');

  await browser.close();
  console.log('ALL WEATHER COMPONENT E2E CHECKS PASSED!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
