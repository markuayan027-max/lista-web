/**
 * Live E2E Testing Script for All Roles - UI/UX Audit
 * Tests Admin, Staff, and Trainee roles on LISTA production site
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://lista.dpdns.org';

const ROLES = {
  admin: {
    name: 'Admin',
    email: 'campionsamuelnapone.0000@gmail.com',
    password: 'Sampot@132!',
    dashboard: '/admin',
    pages: ['/admin', '/admin/announcements', '/admin/enrollments']
  },
  staff: {
    name: 'Staff',
    email: 'dracs008@gmail.com',
    password: 'Staff@Lista2026!',
    dashboard: '/staff',
    pages: ['/staff', '/staff/announcements', '/staff/enrollments']
  },
  trainee: {
    name: 'Trainee',
    email: 'campioncheryl498@gmail.com',
    password: 'e2cVZBsBYEY3ERA!',
    dashboard: '/trainee',
    pages: ['/trainee', '/trainee/application', '/trainee/tracking']
  }
};

async function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page, path, viewport) {
  const safePath = path.replace(/\//g, '-').replace(/^-/, '');
  const filename = `.qa/e2e-audit/${safePath}-${viewport}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  return filename;
}

async function auditPage(page, url) {
  const startTime = Date.now();
  const issues = [];
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    // Check page title
    const title = await page.title();
    if (!title || title.includes('undefined') || title.includes('404')) {
      issues.push('Page title is missing or shows error');
    }
    
    // Check for visible content
    const bodyText = await page.textContent('body');
    if (!bodyText || bodyText.trim().length < 10) {
      issues.push('Page appears to have no visible content');
    }
    
    // Check for 404
    const heading = await page.$('h1');
    if (heading) {
      const text = await heading.textContent();
      if (text && (text.includes('404') || text.includes('Not Found'))) {
        issues.push('Page shows 404 error');
      }
    }
    
    return { loadTime, issues };
  } catch (error) {
    return { loadTime: Date.now() - startTime, issues: [`Error: ${error.message}`] };
  }
}

async function runAudit() {
  console.log('Starting LISTA E2E Audit for all roles...\n');
  
  const results = [];
  ensureDirectory('.qa/e2e-audit');
  
  const browser = await chromium.launch({ headless: true });
  
  for (const [roleKey, role] of Object.entries(ROLES)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${role.name} Role`);
    console.log(`${'='.repeat(60)}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const auditResult = {
      role: role.name,
      email: role.email,
      login: { success: false, error: null },
      pages: [],
      overall: { score: 100, issues: [], recommendations: [] }
    };
    
    try {
      // Navigate to login and wait for full load
      console.log(`\n1. Testing Login...`);
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for React to hydrate
      
      // Take screenshot of login page
      await takeScreenshot(page, 'login-page', `${role.name.toLowerCase()}-login`);
      
      // Find and fill the email input
      console.log(`   Looking for email input...`);
      const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      
      // Fill credentials
      await emailInput.fill(role.email);
      console.log(`   Email entered: ${role.email}`);
      
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      await passwordInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await passwordInput.fill(role.password);
      console.log(`   Password entered`);
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      console.log(`   Clicking submit...`);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {}),
        submitButton.click()
      ]);
      
      // Wait for any redirects
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`   Current URL after login: ${currentUrl}`);
      
      // Check for successful login
      if (currentUrl.includes(roleKey) && !currentUrl.includes('/login')) {
        auditResult.login.success = true;
        console.log(`   ✓ Login successful - redirected to ${role.name} dashboard`);
      } else {
        // Check for error message
        const errorAlert = await page.$('[role="alert"], .text-red, [class*="error"]');
        if (errorAlert) {
          const errorText = await errorAlert.textContent();
          auditResult.login.error = `Login failed: ${errorText}`;
          console.log(`   ✗ ${auditResult.login.error}`);
        } else {
          auditResult.login.error = `Unexpected URL after login: ${currentUrl}`;
          console.log(`   ✗ ${auditResult.login.error}`);
        }
        auditResult.overall.score -= 30;
        
        // Take screenshot of error
        await takeScreenshot(page, `${role.name.toLowerCase()}-login-error`, 'error');
      }
      
      if (auditResult.login.success) {
        // Test dashboard (Desktop)
        console.log(`\n2. Testing Dashboard (Desktop 1280x800)...`);
        await page.setViewportSize({ width: 1280, height: 800 });
        const dashboardAudit = await auditPage(page, `${BASE_URL}${role.dashboard}`);
        const desktopScreenshot = await takeScreenshot(page, role.dashboard, 'desktop-1280');
        auditResult.pages.push({
          path: role.dashboard,
          desktop: { screenshot: desktopScreenshot, ...dashboardAudit }
        });
        console.log(`   Load time: ${dashboardAudit.loadTime}ms`);
        if (dashboardAudit.issues.length > 0) {
          dashboardAudit.issues.forEach(i => console.log(`   - ${i}`));
          auditResult.overall.score -= 5;
          auditResult.overall.issues.push(...dashboardAudit.issues);
        } else {
          console.log(`   ✓ No major issues`);
        }
        
        // Test a few pages
        const pagesToTest = role.pages.filter(p => p !== role.dashboard).slice(0, 2);
        for (const pagePath of pagesToTest) {
          console.log(`\n3. Testing ${pagePath}...`);
          const pageAudit = await auditPage(page, `${BASE_URL}${pagePath}`);
          const screenshot = await takeScreenshot(page, pagePath, 'desktop-1280');
          auditResult.pages.push({
            path: pagePath,
            desktop: { screenshot, ...pageAudit }
          });
          console.log(`   Load time: ${pageAudit.loadTime}ms`);
          if (pageAudit.issues.length > 0) {
            pageAudit.issues.forEach(i => console.log(`   - ${i}`));
            auditResult.overall.score -= 3;
          } else {
            console.log(`   ✓ No major issues`);
          }
        }
        
        // Test mobile
        console.log(`\n4. Testing Mobile (390x844)...`);
        await page.setViewportSize({ width: 390, height: 844 });
        const mobileAudit = await auditPage(page, `${BASE_URL}${role.dashboard}`);
        const mobileScreenshot = await takeScreenshot(page, role.dashboard, 'mobile-390');
        if (auditResult.pages[0]) {
          auditResult.pages[0].mobile = { screenshot: mobileScreenshot, ...mobileAudit };
        }
        console.log(`   Load time: ${mobileAudit.loadTime}ms`);
        if (mobileAudit.issues.length > 0) {
          mobileAudit.issues.forEach(i => console.log(`   - ${i}`));
          auditResult.overall.score -= 5;
        } else {
          console.log(`   ✓ No major issues`);
        }
      }
      
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
      auditResult.login.error = error.message;
      auditResult.overall.score = 0;
      await takeScreenshot(page, `${role.name.toLowerCase()}-error`, 'error');
    }
    
    // Ensure score doesn't go below 0
    auditResult.overall.score = Math.max(0, auditResult.overall.score);
    
    // Recommendations
    if (auditResult.overall.score >= 90) {
      auditResult.overall.recommendations.push('Excellent UI/UX - maintain current standards');
    } else if (auditResult.overall.score >= 70) {
      auditResult.overall.recommendations.push('Good UI/UX - address identified issues');
    } else {
      auditResult.overall.recommendations.push('UI/UX needs attention - critical issues found');
    }
    
    await context.close();
    results.push(auditResult);
    
    console.log(`\n${role.name} Score: ${auditResult.overall.score}/100`);
  }
  
  await browser.close();
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(60));
  
  for (const result of results) {
    console.log(`\n${result.role} Role (${result.email}):`);
    console.log(`  Login: ${result.login.success ? '✓ Success' : '✗ Failed'}`);
    if (result.login.error) console.log(`  Error: ${result.login.error}`);
    console.log(`  Overall Score: ${result.overall.score}/100`);
    result.overall.recommendations.forEach(r => console.log(`  → ${r}`));
  }
  
  // Save detailed report
  const reportPath = `.qa/e2e-audit/report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  // Save markdown report
  const mdReport = `# LISTA E2E Audit Report
Generated: ${new Date().toISOString()}

## Summary

| Role | Login | Score | Status |
|------|-------|-------|--------|
${results.map(r => `| ${r.role} | ${r.login.success ? '✓' : '✗'} | ${r.overall.score}/100 | ${r.overall.score >= 90 ? 'Excellent' : r.overall.score >= 70 ? 'Good' : 'Needs Work'} |`).join('\n')}

## Detailed Results

${results.map(r => `
### ${r.role} Role

**Login Test:** ${r.login.success ? '✓ Successful' : '✗ Failed'}
${r.login.error ? `**Error:** ${r.login.error}` : ''}

**Pages Tested:**
${r.pages.map(p => `- ${p.path} (Desktop: ${p.desktop.loadTime}ms${p.mobile ? `, Mobile: ${p.mobile.loadTime}ms` : ''})`).join('\n')}

**Issues Found:** ${r.overall.issues.length > 0 ? r.overall.issues.join(', ') : 'None'}

**Recommendations:**
${r.overall.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n')}

---
*Report generated by LISTA E2E Audit Script*
`;
  
  const mdPath = `.qa/e2e-audit/REPORT.md`;
  fs.writeFileSync(mdPath, mdReport);
  console.log(`Markdown report saved to: ${mdPath}`);
  
  return results;
}

runAudit().catch(console.error);
