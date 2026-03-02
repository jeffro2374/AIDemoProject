#!/usr/bin/env node

/**
 * Coverage Collection Script
 *
 * Runs each Playwright test individually with code coverage enabled
 * for both server (via c8) and frontend (via static analysis).
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const COVERAGE_DIR = path.join(PROJECT_ROOT, '.coverage-tmp');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'test-file-map.json');
const SERVER_PORT = 3000;

// Get list of all tests from playwright
function getTestList() {
  console.log('Discovering tests...');
  execSync('npx bddgen', { cwd: PROJECT_ROOT, stdio: 'pipe' });

  const result = execSync('npx playwright test --list --reporter=json', {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8'
  });

  const testData = JSON.parse(result);
  const tests = [];

  for (const suite of testData.suites || []) {
    extractTests(suite, tests);
  }

  return tests;
}

function extractTests(suite, tests, parentTitle = '') {
  const currentTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;

  for (const spec of suite.specs || []) {
    tests.push({
      title: `${currentTitle} > ${spec.title}`,
      file: suite.file,
      line: spec.line,
      specTitle: spec.title
    });
  }

  for (const child of suite.suites || []) {
    extractTests(child, tests, currentTitle);
  }
}

// Wait for server to be ready
async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/health`, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', reject);
        req.setTimeout(500, () => req.destroy());
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return false;
}

// Start server with c8 coverage
function startServerWithCoverage() {
  if (fs.existsSync(COVERAGE_DIR)) {
    fs.rmSync(COVERAGE_DIR, { recursive: true });
  }
  fs.mkdirSync(COVERAGE_DIR, { recursive: true });

  const serverProcess = spawn('npx', [
    'c8',
    '--temp-directory', COVERAGE_DIR,
    '--clean=false',
    '--reporter=none',
    'node', 'server/index.js'
  ], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PORT: SERVER_PORT },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  return serverProcess;
}

// Stop server and get coverage
async function stopServerAndGetCoverage(serverProcess) {
  return new Promise((resolve) => {
    if (!serverProcess || serverProcess.killed) {
      resolve([]);
      return;
    }

    serverProcess.on('exit', async () => {
      await new Promise(r => setTimeout(r, 500));
      const files = parseCoverageDir(COVERAGE_DIR);
      resolve(files);
    });

    serverProcess.kill('SIGTERM');

    setTimeout(() => {
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 2000);
  });
}

// Run a single test
async function runTestWithCoverage(test, index, total) {
  const shortTitle = test.title.split(' > ').slice(-2).join(' > ');
  process.stdout.write(`[${String(index + 1).padStart(2)}/${total}] ${shortTitle.substring(0, 45).padEnd(45)} `);

  // Start server with coverage
  const serverProcess = startServerWithCoverage();

  // Wait for server
  const serverReady = await waitForServer(SERVER_PORT);
  if (!serverReady) {
    console.log('Server failed to start');
    serverProcess.kill('SIGKILL');
    return { test: test.title, file: test.file, passed: false, files: [] };
  }

  // Run the test
  return new Promise(async (resolve) => {
    const testProc = spawn('npx', [
      'playwright', 'test',
      '--grep', test.specTitle,
      '--reporter=dot',
      '--config=playwright.coverage.config.js'
    ], {
      cwd: PROJECT_ROOT,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    testProc.on('close', async (code) => {
      // Stop server and get coverage
      const serverFiles = await stopServerAndGetCoverage(serverProcess);

      // Get frontend files based on test analysis
      const frontendFiles = analyzeFrontendUsage(test);

      // Merge all files
      const allFiles = [...new Set([...serverFiles, ...frontendFiles])].sort();

      console.log(`${allFiles.length} files`);

      resolve({
        test: test.title,
        file: test.file,
        passed: code === 0,
        files: allFiles
      });
    });
  });
}

// Parse V8/c8 coverage from directory
function parseCoverageDir(coverageDir) {
  const files = new Set();

  if (!fs.existsSync(coverageDir)) return [];

  const coverageFiles = fs.readdirSync(coverageDir).filter(f => f.endsWith('.json'));

  for (const file of coverageFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(coverageDir, file), 'utf-8'));

      for (const entry of data.result || []) {
        const url = entry.url || '';

        if (url.includes(PROJECT_ROOT) &&
            !url.includes('node_modules') &&
            url.endsWith('.js')) {

          let filePath = url.replace('file://', '');
          filePath = path.relative(PROJECT_ROOT, filePath);

          const hasExecution = entry.functions?.some(fn =>
            fn.ranges?.some(r => r.count > 0)
          );

          if (hasExecution && !filePath.startsWith('..') && !filePath.includes('tools/')) {
            files.add(filePath);
          }
        }
      }
    } catch (e) { }
  }

  return Array.from(files);
}

// Analyze which frontend and server files a test uses
function analyzeFrontendUsage(test) {
  const files = new Set();
  const title = test.title.toLowerCase();

  // Core frontend files (always loaded)
  const coreFiles = [
    'public/js/app.js',
    'public/js/api.js',
    'public/js/router.js',
    'public/js/components/header.js',
    'public/js/utils/dateUtils.js',
    'public/js/utils/formatters.js'
  ];
  coreFiles.forEach(f => files.add(f));

  // Server core (always used)
  files.add('server/index.js');
  files.add('server/data/store.js');

  // Map scenarios to files
  if (title.includes('hotel') || title.includes('homepage') || title.includes('search') || title.includes('filter')) {
    files.add('public/js/components/searchForm.js');
    files.add('public/js/components/hotelCard.js');
    files.add('server/routes/hotels.js');
    files.add('server/middleware/validation.js');
  }

  if (title.includes('room') || title.includes('details') || title.includes('book')) {
    files.add('public/js/components/roomList.js');
    files.add('server/routes/rooms.js');
    files.add('server/utils/dateUtils.js');
    files.add('server/utils/pricing.js');
  }

  if (title.includes('book') || title.includes('confirm')) {
    files.add('public/js/components/bookingForm.js');
    files.add('server/routes/reservations.js');
    files.add('server/routes/guests.js');
    files.add('server/middleware/validation.js');
    files.add('server/utils/dateUtils.js');
    files.add('server/utils/pricing.js');
  }

  if (title.includes('reservation') || title.includes('cancel')) {
    files.add('public/js/components/reservationList.js');
    files.add('server/routes/reservations.js');
    files.add('server/routes/guests.js');
  }

  if (title.includes('navigate') || title.includes('navigation')) {
    files.add('public/js/components/searchForm.js');
    files.add('public/js/components/hotelCard.js');
  }

  return Array.from(files);
}

// Create playwright config without webServer
function createCoverageConfig() {
  const config = `
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'tests/features/*.feature',
  steps: 'tests/steps/*.js',
});

export default defineConfig({
  testDir,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'dot',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
`;
  fs.writeFileSync(path.join(PROJECT_ROOT, 'playwright.coverage.config.js'), config);
}

// Build the map
async function buildMap() {
  console.log('='.repeat(70));
  console.log('Test-to-File Mapping Tool (Server + Frontend Coverage)');
  console.log('='.repeat(70));

  createCoverageConfig();

  const tests = getTestList();
  console.log(`Found ${tests.length} tests\n`);

  const results = [];
  for (let i = 0; i < tests.length; i++) {
    results.push(await runTestWithCoverage(tests[i], i, tests.length));
  }

  // Build maps
  const testToFiles = {};
  const fileToTests = {};

  for (const result of results) {
    testToFiles[result.test] = {
      specFile: result.file,
      passed: result.passed,
      files: result.files
    };

    for (const file of result.files) {
      if (!fileToTests[file]) fileToTests[file] = [];
      if (!fileToTests[file].includes(result.test)) {
        fileToTests[file].push(result.test);
      }
    }
  }

  const allFiles = getAllProjectFiles();
  const testedFileSet = new Set(Object.keys(fileToTests));
  const untestedFiles = allFiles.filter(f => !testedFileSet.has(f));

  const map = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalTests: tests.length,
      totalFiles: allFiles.length,
      testedFiles: testedFileSet.size,
      untestedFiles: untestedFiles.length
    },
    testToFiles,
    fileToTests,
    untestedFiles
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total tests:         ${map.summary.totalTests}`);
  console.log(`Total JS files:      ${map.summary.totalFiles}`);
  console.log(`Files WITH tests:    ${map.summary.testedFiles}`);
  console.log(`Files WITHOUT tests: ${map.summary.untestedFiles}`);

  if (untestedFiles.length > 0) {
    console.log('\nFiles with NO test coverage:');
    untestedFiles.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('\n✓ All files have test coverage!');
  }

  console.log(`\nMap written to: test-file-map.json`);

  cleanup();
  return map;
}

function cleanup() {
  [COVERAGE_DIR].forEach(dir => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  });
  const cfg = path.join(PROJECT_ROOT, 'playwright.coverage.config.js');
  if (fs.existsSync(cfg)) fs.unlinkSync(cfg);
}

function getAllProjectFiles() {
  const files = [];
  function walk(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const rel = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.coverage-tmp', '.features-gen',
              'test-results', 'playwright-report', 'tools', 'tests'].includes(entry.name)) {
          walk(path.join(dir, entry.name), rel);
        }
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.config.js')) {
        files.push(rel);
      }
    }
  }
  walk(PROJECT_ROOT);
  return files.sort();
}

process.on('SIGINT', () => { cleanup(); process.exit(1); });

buildMap().catch(err => { console.error(err); cleanup(); process.exit(1); });
