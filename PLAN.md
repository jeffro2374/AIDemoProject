# Plan: Test Impact Analysis Tool

## The Problem

In large codebases, running the full test suite for every code change is slow and wasteful. A typical scenario:

- **In extreme example of a mature framework : 4,000+ tests taking 45+ minutes to run**
- Developers wait unnecessarily for tests unrelated to their changes -> No fast seedback
- CI pipelines become bottlenecks, slowing down the entire team
- No visibility into which files lack test coverage

## The Solution

Build a **Test-to-File Mapping Tool** that:

1. **Maps each test to the source files it touches** during execution
2. **Identifies coverage gaps** — files with no tests at all
3. **Enables selective test execution** — given a set of changed files (from git), run only the tests that could be affected

## Why It's Useful

| Benefit | Impact |
|---------|--------|
| Faster CI pipelines | 50-90% reduction in test execution time |
| Faster developer feedback | Know if your change broke something in seconds, not minutes |
| Coverage visibility | Identify files that need manual testing or new automated tests |
| Confident deployments | Know exactly what was tested for each change |

### ROI Example

For a codebase with 4,000 tests:
- **Before**: Run all tests = 45 min CI time per PR
- **After**: Run only affected tests (avg 5%) = 2-3 min
- **Savings**: 40+ minutes per PR × multiple PRs/day = hours saved daily

## Approach

1. Create a sample web application (Hotel Reservation System) with frontend and backend
2. Write end-to-end tests using Playwright + Cucumber (BDD style)
3. Build tooling to run each test with code coverage enabled
4. Generate a bidirectional map: test → files and file → tests
5. Create CLI tools to query the map and run affected tests

## Build Checklist

### Sample Application
- [x] Express.js backend with REST API
- [x] Vanilla JavaScript frontend (ES modules)
- [x] Hotel browsing and search functionality
- [x] Room availability and booking flow
- [x] Reservation management (view, cancel)
- [x] In-memory data store with sample data

### End-to-End Tests
- [x] Playwright + Cucumber (playwright-bdd) setup
- [x] 5 feature files with Gherkin scenarios
- [x] 16 test scenarios covering all major flows
- [x] Step definitions for all scenarios
- [x] Tests pass reliably

### Test-to-File Mapping Tool
- [x] Coverage collection using V8/c8 for server-side code
- [x] Static analysis for frontend file mapping
- [x] Per-test coverage isolation (restart server for each test)
- [x] Bidirectional map generation (test → files, file → tests)
- [x] Identification of untested files

### CLI Query Tools
- [x] `npm run map:generate` — Build the test-file map
- [x] `npm run map:summary` — Show coverage summary
- [x] `npm run map:untested` — List files with no test coverage
- [x] `node tools/query-map.js file <path>` — Show tests for a file
- [x] `node tools/query-map.js test <name>` — Show files for a test
- [x] `npm run test:affected <branch>` — Run only affected tests

### Documentation
- [x] README with setup instructions
- [x] Business value explanation
- [x] Command reference
- [x] CI/CD integration example

## AI-Assisted Development

This project was built using **Claude Code** (Claude Opus 4.5) as a pair programming partner. The AI assisted with:

- Application architecture and implementation
- Test scenario design and step definitions
- Coverage collection strategy (V8 + static analysis)
- Debugging test failures and flaky tests
- Documentation and README creation

All code was reviewed and understood before committing. The developer remained responsible for:
- Defining requirements and acceptance criteria
- Validating the solution against real-world QA needs
- Testing and verifying functionality
- Final code review and quality assurance

## Results

| Metric | Value |
|--------|-------|
| Total source files | 18 |
| Files with test coverage | 18 (100%) |
| Total E2E tests | 16 |
| Average tests per file change | 8 (50% reduction) |
| Best case reduction | 75% (4 tests instead of 16) |

## Future Enhancements

1. **Incremental map updates** — Only re-run changed tests when regenerating
2. **CI artifact caching** — Store map between pipeline runs
3. **Branch comparison** — Compare against target branch, not just HEAD
4. **Parallel execution** — Run affected tests in parallel
5. **Integration with test frameworks** — Jest, Mocha, pytest adapters
