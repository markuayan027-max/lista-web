import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { mockAuthState } from './utils/auth-mock';

const outputDir = path.join(__dirname, '..', 'promotional_materials');

// Clean up old screenshots first to ensure only the requested ones are there
if (fs.existsSync(outputDir)) {
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    const filePath = path.join(outputDir, file);
    try {
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error(`Could not delete ${filePath}:`, e);
    }
  }
} else {
  fs.mkdirSync(outputDir, { recursive: true });
}

test.describe('Promotional Screenshots (16:9 Viewport)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Standard 16:9 aspect ratio
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Capture Home Page Highlight Sections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 1. Hero Section (First Fold)
    await page.screenshot({ 
      path: path.join(outputDir, '01-hero-fold.png'),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Captured Hero Fold');
    
    // 2. Accreditation / Trust Bar
    const trust = page.locator('section:has-text("Accredited by National Institutions")');
    if (await trust.isVisible()) {
      await trust.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, '02-trust-bar.png') });
      console.log('Captured Trust Bar');
    }

    // 3. Skills Video Section
    const skills = page.locator('section:has-text("Get Skills for a Better Life")');
    if (await skills.isVisible()) {
      await skills.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, '03-skills-video.png') });
      console.log('Captured Skills Video');
    }

    // 4. Career Pathfinder / Assessment
    const assessment = page.locator('section:has-text("Not sure where to start?")');
    if (await assessment.isVisible()) {
      await assessment.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, '04-assessment-cta.png') });
      console.log('Captured Assessment CTA');
    }
  });

  test('Capture Dashboard Highlights', async ({ page }) => {
    await mockAuthState(page, 'trainee');
    await page.goto('/trainee/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 1. Dashboard Top Fold (Welcome + Stats)
    await page.screenshot({ 
      path: path.join(outputDir, '05-dashboard-top.png'),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Captured Dashboard Top');

    // 2. Specific Stat Cards (Visual highlight)
    const stats = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    if (await stats.isVisible()) {
      await stats.screenshot({ path: path.join(outputDir, '06-dashboard-stats-focus.png') });
      console.log('Captured Dashboard Stats Focus');
    }
  });

  test('Capture Course Catalog Grid', async ({ page }) => {
    await page.goto('/courses', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Capture the main grid area in 16:9
    await page.screenshot({ 
      path: path.join(outputDir, '07-course-grid.png'),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Captured Course Grid');
  });
});
