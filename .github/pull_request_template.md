## Summary of Changes
<!-- Provide a clear, high-level summary of what this pull request introduces or fixes. -->

## Affected Module(s)
<!-- Check all modules that this PR modifies: -->
- [ ] Dashboard
- [ ] Invoices
- [ ] Payments (PayPal Sandbox)
- [ ] AI Assistant
- [ ] Authentication
- [ ] Database Schema & Migrations
- [ ] Shared Packages / Contracts
- [ ] Documentation / Tooling

## Motivation and Context
<!-- Why is this change required? What problem does it solve or what feature does it add? -->

## API & Database Contract Verification
- [ ] Adheres to existing schemas defined in `docs/API_CONTRACTS.md`
- [ ] Any payload updates have been documented in `docs/API_CONTRACTS.md`
- [ ] If database changes are included, a corresponding migration exists in `database/migrations/`
- [ ] Monetary values strictly use numeric/2-decimal precision (no floating-point rounding)
- [ ] Verified that payment status is only updated through backend PayPal capture verification

## Tests Performed
<!-- Describe the tests you ran to verify your changes. Include commands, sample inputs, and outputs. -->
- Command run: `npm test`
- Manual UI / curl verification details:

## Integration Considerations / Breaking Changes
<!-- Does this change introduce breaking changes to existing endpoints or require teammates to update their .env files? -->
- [ ] None
- [ ] Yes (please describe migration steps below):

## Checklist
- [ ] My code follows the project's coding conventions and style guide.
- [ ] I have performed a self-review of my code.
- [ ] I have not committed any `.env` secrets, real PayPal tokens, or AI API keys.
- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] All new and existing unit tests pass locally.
