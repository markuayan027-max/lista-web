# CLAUDE.md - LISTA Development Rules

## Documentation Rules

### Always Use Graphify for Documentation
After any code change or test, ALWAYS run graphify queries and document findings:

```powershell
# Navigate to repo root
cd artifacts/lista

# Query relevant code paths
graphify query "<feature-name> <behavior>"
graphify path "<file>" "<function>"

# Document results in .qa/ subfolder
```

### Documentation Standards
1. **Test Reports:** Save to `.qa/e2e-*/REPORT.md`
2. **Code Changes:** Use graphify to trace and document affected paths
3. **Features:** Document in `docs/FEATURE-NAME.md`
4. **Graphify Reports:** Save to `graphify-out/GRAPH_REPORT.md`

### Required Graphify Queries After Changes
After modifying any code:
1. Run affected path queries
2. Verify no breaking changes
3. Document findings in appropriate doc file
4. Add to PR description

### Quick Documentation Template
```markdown
# Feature: [Name]

## What Changed
[Description of change]

## Graphify Traces
```bash
graphify query "[relevant functions]"
```

## Files Affected
- [List of files]

## Screenshots
[Screenshots if UI change]

## Test Results
[Results from testing]
```

## File Naming Conventions
- E2E Reports: `.qa/e2e-[feature]/REPORT.md`
- Feature Docs: `docs/[FEATURE]-META-PROMPT.md`
- Test Results: `.qa/[test-name]/report.json`

## Graphify Reference
See `docs/GRAPHIFY-SYNC-QUERIES.md` for common queries.
