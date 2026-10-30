import { chromium } from 'playwright';

async function run() {
  console.log('Starting Playwright end-to-end verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Clear localStorage before testing clean flow
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 1. Verify Welcome splash (no email login anywhere)
  console.log('Checking welcome splash...');
  await page.waitForSelector('text=ดินดี เกษตรกรยิ้มได้');
  const pageText = await page.textContent('body');
  if (pageText.includes('อีเมล') || pageText.includes('Email') || pageText.includes('Sign in')) {
    throw new Error('Email sign-in was found on entry screen!');
  }
  console.log('PASS: Zero email barrier on entry.');

  // 2. Click "เริ่มใช้งาน"
  await page.click('button:has-text("เริ่มใช้งาน")');

  // 3. Verify Name input label and placeholder
  console.log('Checking name input label and placeholder...');
  const labelElement = await page.waitForSelector('label[for="display_name_input"]');
  const labelText = await labelElement.textContent();
  console.log('Label text:', labelText.trim());
  if (!labelText.includes('คุณอยากให้เรียกว่าอะไร')) {
    throw new Error(`Expected label "คุณอยากให้เรียกว่าอะไร", got: ${labelText}`);
  }

  const inputPlaceholder = await page.getAttribute('#display_name_input', 'placeholder');
  console.log('Input placeholder:', inputPlaceholder);
  if (!inputPlaceholder.includes('คุณอยากให้เรียกว่าอะไร')) {
    throw new Error(`Expected placeholder "คุณอยากให้เรียกว่าอะไร", got: ${inputPlaceholder}`);
  }

  // Verify no sample names in placeholder
  if (inputPlaceholder.includes('สมชาย') || inputPlaceholder.includes('บุญมี')) {
    throw new Error(`Found sample name in placeholder: ${inputPlaceholder}`);
  }
  console.log('PASS: Name field correctly displays "คุณอยากให้เรียกว่าอะไร" without sample names.');

  // 4. Fill in name and submit
  await page.fill('#display_name_input', 'ลุงชาตรี นครศรี');
  await page.click('button[type="submit"]');

  // 5. Verify Main view rendered
  console.log('Checking main dashboard view...');
  await page.waitForSelector('text=ลุงชาตรี นครศรี');
  console.log('PASS: Entered main dashboard successfully.');

  // 6. Test Owner Mode authentication
  console.log('Testing Owner Mode modal trigger...');
  const ownerButton = await page.waitForSelector('button:has-text("👑")');
  await ownerButton.click();

  // Verify modal is visible
  await page.waitForSelector('text=ยืนยันตัวตนเจ้าของระบบ');
  console.log('PASS: Owner passcode modal opened.');

  // 7. Enter passcode ktpp0602
  console.log('Entering passcode ktpp0602...');
  await page.fill('#owner_passcode_input', 'ktpp0602');
  await page.click('button[type="submit"]:has-text("เข้าสู่โหมดเจ้าของระบบ")');

  // 8. Verify Owner Dashboard
  console.log('Verifying Owner Dashboard is unlocked...');
  await page.waitForSelector('text=ศูนย์ควบคุมเฉพาะเจ้าของระบบ Soil Time');
  await page.waitForSelector('text=สิทธิ์เฉพาะเจ้าของระบบเท่านั้น');
  console.log('PASS: Owner Dashboard successfully active!');

  // Check tabs
  await page.waitForSelector('button:has-text("เกษตรกรทุกคน")');
  await page.waitForSelector('button:has-text("แปลงเกษตรทุกคน")');
  await page.waitForSelector('button:has-text("ปฏิทินปุ๋ยทุกคน")');
  await page.waitForSelector('button:has-text("ศูนย์ตอบข้อความ")');
  await page.waitForSelector('button:has-text("ส่งออกข้อมูล")');

  // Click All Farmers tab
  console.log('Checking All Farmers tab...');
  await page.click('button:has-text("เกษตรกรทุกคน")');
  await page.waitForSelector('text=สุราษฎร์ธานี');
  await page.waitForSelector('text=เชียงใหม่');
  await page.waitForSelector('text=สุพรรณบุรี');
  console.log('PASS: Owner can view all registered farmers across Thailand.');

  // Click All Plots tab
  console.log('Checking All Plots tab...');
  await page.click('button:has-text("แปลงเกษตรทุกคน")');
  await page.waitForSelector('text=pH ดิน');
  console.log('PASS: Owner can view all plots and soil pH levels.');

  // Click Inbox & reply test
  console.log('Checking Inbox tab...');
  await page.click('button:has-text("ศูนย์ตอบข้อความ")');
  await page.waitForSelector('text=ศูนย์รวมข้อความปรึกษาจากเกษตรกรทุกคน');
  console.log('PASS: Owner Inquiries Desk loaded.');

  // 9. Exit Owner Mode
  console.log('Testing exit owner mode...');
  await page.click('button:has-text("กลับสู่โหมดเกษตรกรทั่วไป")');
  await page.waitForSelector('text=ลุงชาตรี นครศรี');
  console.log('PASS: Switched back to normal farmer mode.');

  await browser.close();
  console.log('ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY! 🎉');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
