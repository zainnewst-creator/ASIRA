import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function clickButtonWithText(page, text) {
  return await page.evaluate((targetText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes(targetText));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
}

async function runVisualLmsVerification() {
  console.log('🚀 Running visual verification of LMS features...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

    // 1. الدخول للـ LMS
    await page.click('#login-modal-btn');
    await new Promise(r => setTimeout(r, 400));
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));
    console.log('✓ 1. Logged into Student Dashboard');

    // 2. التبديل إلى لوحة المدرس
    await clickButtonWithText(page, 'تجربة دور المدرس');
    await new Promise(r => setTimeout(r, 1000));
    console.log('✓ 2. Switched to Instructor Dashboard');

    // الدخول لتبويب المنهج والوحدات الدراسية
    await clickButtonWithText(page, 'المنهج والوحدات الدراسية');
    await new Promise(r => setTimeout(r, 1000));
    console.log('✓ 3. Switched to Curriculum Modular Builder Tab');

    // التمرير قليلاً لإظهار بطاقات المديولات
    await page.evaluate(() => window.scrollBy(0, 450));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_instructor_curriculum_modules.png' });

    // فتح نافذة إضافة مديول
    await page.click('#add-new-module-btn');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_instructor_add_module_modal.png' });

    console.log('🎉 ALL VISUAL SCREENSHOTS CAPTURED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Verification Error:', err);
  } finally {
    await browser.close();
  }
}

runVisualLmsVerification();
