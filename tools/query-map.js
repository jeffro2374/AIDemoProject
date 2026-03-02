#!/usr/bin/env node

/**
 * Test Map Query Tool
 *
 * Query the test-to-file map to find:
 * - Which tests cover a file
 * - Which files a test touches
 * - Which tests to run for changed files
 * - Which files have no test coverage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MAP_FILE = path.join(PROJECT_ROOT, 'test-file-map.json');

// Load the map
function loadMap() {
  if (!fs.existsSync(MAP_FILE)) {
    console.error('Error: test-file-map.json not found.');
    console.error('Run "node tools/collect-coverage.js" first to generate the map.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8'));
}

// Get tests for a specific file
function getTestsForFile(map, filePath) {
  // Normalize the path
  const normalizedPath = filePath.replace(/^\.\//, '');

  const tests = map.fileToTests[normalizedPath] || [];
  return tests;
}

// Get files touched by a specific test
function getFilesForTest(map, testPattern) {
  const results = [];

  for (const [testName, data] of Object.entries(map.testToFiles)) {
    if (testName.toLowerCase().includes(testPattern.toLowerCase())) {
      results.push({
        test: testName,
        files: data.files
      });
    }
  }

  return results;
}

// Get tests to run for changed files (from git)
function getTestsForChanges(map, baseRef = 'HEAD~1') {
  let changedFiles;

  try {
    const gitOutput = execSync(`git diff --name-only ${baseRef}`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8'
    });
    changedFiles = gitOutput.trim().split('\n').filter(f => f);
  } catch (e) {
    console.error('Error getting git diff:', e.message);
    return { changedFiles: [], tests: [] };
  }

  const testsToRun = new Set();

  for (const file of changedFiles) {
    const tests = map.fileToTests[file] || [];
    tests.forEach(t => testsToRun.add(t));
  }

  return {
    changedFiles,
    tests: Array.from(testsToRun)
  };
}

// Print summary report
function printSummary(map) {
  console.log('='.repeat(60));
  console.log('Test-to-File Map Summary');
  console.log('='.repeat(60));
  console.log(`Generated: ${map.generatedAt}`);
  console.log(`Total tests: ${map.summary.totalTests}`);
  console.log(`Total JS files: ${map.summary.totalFiles}`);
  console.log(`Files with tests: ${map.summary.testedFiles}`);
  console.log(`Files without tests: ${map.summary.untestedFiles}`);
  console.log('');
}

// Print untested files
function printUntestedFiles(map) {
  console.log('Files with NO test coverage:');
  console.log('-'.repeat(40));

  if (map.untestedFiles.length === 0) {
    console.log('  All files have test coverage!');
  } else {
    for (const file of map.untestedFiles) {
      console.log(`  ${file}`);
    }
  }
  console.log('');
}

// Print file coverage details
function printFileCoverage(map) {
  console.log('File Coverage Details:');
  console.log('-'.repeat(60));

  const files = Object.entries(map.fileToTests)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [file, tests] of files) {
    console.log(`\n${file} (${tests.length} tests)`);
    for (const test of tests) {
      const shortTest = test.split(' > ').slice(-2).join(' > ');
      console.log(`  - ${shortTest}`);
    }
  }
}

// Main CLI
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(`
Test Map Query Tool

Usage:
  node tools/query-map.js <command> [options]

Commands:
  summary              Show map summary
  untested             List files with no test coverage
  coverage             Show detailed file coverage
  file <path>          Show tests that cover a specific file
  test <pattern>       Show files touched by tests matching pattern
  changes [base-ref]   Show tests to run for git changes (default: HEAD~1)
  run-affected [base]  Run only tests affected by git changes

Examples:
  node tools/query-map.js summary
  node tools/query-map.js file server/routes/hotels.js
  node tools/query-map.js test "booking"
  node tools/query-map.js changes main
  node tools/query-map.js run-affected main
`);
    return;
  }

  const map = loadMap();

  switch (command) {
    case 'summary':
      printSummary(map);
      break;

    case 'untested':
      printSummary(map);
      printUntestedFiles(map);
      break;

    case 'coverage':
      printFileCoverage(map);
      break;

    case 'file': {
      const filePath = args[1];
      if (!filePath) {
        console.error('Error: Please specify a file path');
        process.exit(1);
      }
      const tests = getTestsForFile(map, filePath);
      console.log(`\nTests covering: ${filePath}`);
      console.log('-'.repeat(40));
      if (tests.length === 0) {
        console.log('  No tests cover this file');
      } else {
        console.log(`  ${tests.length} test(s):\n`);
        for (const test of tests) {
          console.log(`  - ${test}`);
        }
      }
      break;
    }

    case 'test': {
      const pattern = args[1];
      if (!pattern) {
        console.error('Error: Please specify a test pattern');
        process.exit(1);
      }
      const results = getFilesForTest(map, pattern);
      console.log(`\nTests matching: "${pattern}"`);
      console.log('-'.repeat(40));
      if (results.length === 0) {
        console.log('  No matching tests found');
      } else {
        for (const { test, files } of results) {
          console.log(`\n${test}`);
          console.log(`  Touches ${files.length} files:`);
          for (const file of files.slice(0, 10)) {
            console.log(`    - ${file}`);
          }
          if (files.length > 10) {
            console.log(`    ... and ${files.length - 10} more`);
          }
        }
      }
      break;
    }

    case 'changes': {
      const baseRef = args[1] || 'HEAD~1';
      const { changedFiles, tests } = getTestsForChanges(map, baseRef);

      console.log(`\nChanged files since ${baseRef}:`);
      console.log('-'.repeat(40));
      for (const f of changedFiles) {
        console.log(`  ${f}`);
      }

      console.log(`\nTests to run (${tests.length}):`);
      console.log('-'.repeat(40));
      if (tests.length === 0) {
        console.log('  No tests affected by these changes');
      } else {
        for (const test of tests) {
          console.log(`  - ${test}`);
        }
      }
      break;
    }

    case 'run-affected': {
      const baseRef = args[1] || 'HEAD~1';
      const { tests } = getTestsForChanges(map, baseRef);

      if (tests.length === 0) {
        console.log('No tests affected by changes');
        return;
      }

      console.log(`Running ${tests.length} affected tests...\n`);

      // Build grep pattern for affected tests
      const testNames = tests.map(t => t.split(' > ').slice(-1)[0]);
      const grepPattern = testNames.join('|');

      try {
        execSync(`npx playwright test --grep "${grepPattern}"`, {
          cwd: PROJECT_ROOT,
          stdio: 'inherit'
        });
      } catch (e) {
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node tools/query-map.js help" for usage');
      process.exit(1);
  }
}

main();
