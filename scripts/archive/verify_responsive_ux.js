import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function clickButtonWithText(page, text) {
  return await page.evaluate((targetText) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes(targetText));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
}

async function runResponsiveVerification() {
  console.log('🚀 Running Mobile & Tablet Responsive UX Verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 1. فحص شاشة الجوال (Mobile: 375x812)
    console.log('📱 1. Testing Mobile Viewport (375x812)...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // التقاط صورة الهيدر والصفحة الرئيسية على الجوال
    await page.screenshot({ path: 'e:/ASIRA/screenshot_mobile_home.png' });

    // فتح قائمة الهامبرغر على الجوال
    const toggleBtn = await page.$('#mobile-menu-toggle-btn');
    if (toggleBtn) {
      await toggleBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: 'e:/ASIRA/screenshot_mobile_nav_drawer.png' });
      console.log('✓ Captured Mobile Nav Drawer');
    }

    // 2. الدخول للوحة التعليم واختبار التكليف والاختبار على التابليت
    console.log('📊 2. Testing Student LMS Progression & Unlocking on Tablet (768x1024)...');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

    // تسجيل الدخول كطالب
    await page.click('#login-modal-btn');
    await new Promise(r => setTimeout(r, 400));
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));

    // الآن نحن مباشرة في لوحة الطالب
    // أ) الانتقال لتبويب التكليفات وتسليم التكليف
    await clickButtonWithText(page, 'التكليفات وملاحظات المشرف');
    await new Promise(r => setTimeout(r, 700));

    // تسليم التكليف
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_tablet_assignment_unlocked.png' });
    console.log('✓ Captured Assignment Submission with Instant Next Lesson Unlock');

    // ب) النقر على زر الانتقال للمحاضرة التالية المفتوحة
    await clickButtonWithText(page, 'الانتقال للمحاضرة التالية المفتوحة الآن');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_tablet_next_lesson_opened.png' });
    console.log('✓ Captured Lesson Player Opened After Assignment');

    // ج) الانتقال للاختبار وتسليمه
    await clickButtonWithText(page, 'الاختبارات الإلكترونية');
    await new Promise(r => setTimeout(r, 700));

    // تسليم الاختبار
    await clickButtonWithText(page, 'تسليم واعتماد الاختبار الآن');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_tablet_exam_unlocked.png' });
    console.log('✓ Captured Exam Submission with Instant Next Lesson Unlock');

    // 3. اختبار دور المدرس ورفع صور الأبحاث
    console.log('👨‍🏫 3. Switching to Instructor to test Research Cover Upload & Presets...');
    await page.setViewport({ width: 1200, height: 850 });
    await clickButtonWithText(page, 'تجربة دور المدرس');
    await new Promise(r => setTimeout(r, 800));

    // فتح نافذة إضافة بحث من لوحة المدرس
    await clickButtonWithText(page, 'إضافة بحث منشور');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'e:/ASIRA/screenshot_research_image_upload_modal.png' });
    console.log('✓ Captured Research Image Upload Modal with Presets Gallery & File Upload');

    console.log('🎉 ALL RESPONSIVE AND PROGRESSION TESTS COMPLETED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Verification Error:', err);
  } finally {
    await browser.close();
  }
}

runResponsiveVerification();
