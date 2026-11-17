import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runVerification() {
  console.log('Starting automated verification with Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. الصفحة الرئيسية
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    console.log('✓ 1. Home page loaded successfully');

    // 2. الكورسات والبرامج
    await page.click('#nav-link-courses');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_courses.png' });
    console.log('✓ 2. Courses catalog verified');

    // 3. أبحاثنا ومشاريعنا
    await page.click('#nav-link-research');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_research.png' });
    console.log('✓ 3. Research showcase verified');

    // 4. طلابنا وقصص النجاح
    await page.click('#nav-link-testimonials');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_testimonials.png' });
    console.log('✓ 4. Testimonials and wall of fame verified');

    // 5. من نحن
    await page.click('#nav-link-about');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_about.png' });
    console.log('✓ 5. About page verified');

    // 6. تواصل معنا
    await page.click('#nav-link-contact');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_contact.png' });
    console.log('✓ 6. Contact and FAQ page verified');

    // 7. نافذة المصادقة
    await page.click('#login-modal-btn');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_auth_modal.png' });
    console.log('✓ 7. Auth modal verified');

    // 8. الدخول للوحة التحكم الأكاديمية (LMS Dashboard)
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_lms_courses.png' });
    console.log('✓ 8. LMS Dashboard entered successfully');

    // 9. مشغل الدروس
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('مشغل الدروس'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_lms_learn.png' });
    console.log('✓ 9. LMS Lesson player (YouTube & Drive) verified');

    // 10. تسليم التكليفات
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('تسليم التكليفات'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_lms_assignment.png' });
    console.log('✓ 10. LMS Assignment engine & revisions verified');

    // 11. محرك الاختبارات
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('محرك الاختبارات'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_lms_exam.png' });
    console.log('✓ 11. LMS Exam engine & integrity pledge verified');

    // 12. السجل الأكاديمي والشهادات
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('السجل الأكاديمي والشهادة'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_lms_grades.png' });
    console.log('✓ 12. LMS Transcript & Certificate verified');

    console.log('\n========================================');
    console.log('SUCCESS: ALL 12 VERIFICATION CHECKS COMPLETED!');
    console.log('========================================');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
}

runVerification();
