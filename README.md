# Test Impact Analysis Tool

A proof-of-concept demonstrating **intelligent test selection** based on code changes. Instead of running all tests for every change, this tool identifies exactly which tests need to run.

## Business Value

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Tests run per change | ALL (16) | Only affected (avg 8) | **50% reduction** |
| CI pipeline time | ~2 min | ~1 min | **50% faster** |
| Developer feedback loop | Slow | Fast | **Improved productivity** |

### ROI Example (at scale)

For a codebase with 4,000 tests:
- **Current state**: Run all 4,000 tests = 45 min CI time
- **With this tool**: Run only affected tests (avg 200) = 2-3 min
- **Savings**: 40+ minutes per PR, faster developer iteration

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Git Changes    │────▶│  Test-File Map   │────▶│  Affected Tests │
│  (files changed)│     │  (lookup table)  │     │  (run only these)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **Map Generation**: Run each test with coverage tracking to build a map of which files each test touches
2. **Change Detection**: Use git diff to identify changed files
3. **Test Selection**: Look up changed files in the map to find affected tests
4. **Selective Execution**: Run only the tests that could be affected by the changes

## Quick Demo

```bash
# Install dependencies
npm install

# Generate the test-to-file map (one-time, ~2 min)
npm run map:generate

# See which tests cover a specific file
node tools/query-map.js file server/routes/reservations.js
# Output: 8 tests (not all 16)

# Run only tests affected by recent changes
npm run test:affected main
```

## The Test-File Map

Shows exactly which tests need to run when a file changes:

| Source File | Tests Required | Reduction |
|-------------|----------------|-----------|
| `server/routes/reservations.js` | 8 tests | 50% |
| `public/js/components/bookingForm.js` | 5 tests | 69% |
| `public/js/components/reservationList.js` | 4 tests | 75% |
| `server/utils/pricing.js` | 6 tests | 63% |
| Core files (api.js, app.js, router.js) | ALL tests | 0% |

## Project Structure

```
├── server/                    # Express.js backend
│   ├── routes/               # API endpoints
│   ├── data/                 # In-memory data store
│   └── utils/                # Utilities (pricing, dates)
├── public/                    # Frontend (vanilla JS)
│   └── js/
│       ├── components/       # UI components
│       └── utils/            # Frontend utilities
├── tests/
│   ├── features/             # Cucumber/Gherkin scenarios
│   └── steps/                # Step definitions
├── tools/
│   ├── collect-coverage.js   # Builds the test-file map
│   └── query-map.js          # Query tool for the map
└── test-file-map.json        # Generated mapping data
```

## Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run map:generate` | Build the test-to-file map |
| `npm run map:summary` | Show coverage summary |
| `npm run map:untested` | List files with no test coverage |
| `npm run test:affected` | Run only tests affected by git changes |

## Sample Application

The demo uses a simple **Hotel Reservation System** with:
- 3 hotels with rooms
- Search by location/dates
- Booking flow with pricing
- Reservation management

**16 end-to-end tests** written as Cucumber scenarios covering:
- Hotel browsing and search
- Room booking flow
- Reservation viewing and cancellation
- Site navigation

## CI/CD Integration

Add to your pipeline:

```yaml
# .github/workflows/test.yml
- name: Run affected tests
  run: |
    npm run map:generate  # Or cache this artifact
    npm run test:affected ${{ github.event.pull_request.base.sha }}
```

## Key Benefits

1. **Faster CI Pipelines**: Only run tests that matter
2. **Faster Developer Feedback**: Know if your change broke something in seconds
3. **Identify Coverage Gaps**: See which files have no tests
4. **Confident Deployments**: Know exactly what was tested

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript (ES modules)
- **Testing**: Playwright + Cucumber (BDD)
- **Coverage**: V8 native coverage + c8

## Next Steps for Production

1. **Cache the map**: Store `test-file-map.json` as a CI artifact
2. **Incremental updates**: Only regenerate map when test files change
3. **Branch-aware**: Compare against target branch, not just HEAD~1
4. **Parallel execution**: Run affected tests in parallel for even faster feedback

---

*Built as a proof-of-concept for Test Impact Analysis*
