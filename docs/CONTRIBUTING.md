# Contributing to PayPilot AI

Thank you for your interest in contributing to **PayPilot AI**! We follow a fork-and-pull-request Git collaboration model so every contributor can develop and test features independently.

---

## 1. Step-by-Step GitHub Workflow

### Step 1: Fork the Repository
Click the **Fork** button at the top right of the PayPilot AI main GitHub repository. This creates a copy under your personal GitHub account (`https://github.com/YOUR_USERNAME/paypilot-ai`).

### Step 2: Clone Your Fork
Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/paypilot-ai.git
cd paypilot-ai
```

### Step 3: Add Upstream Remote
Configure a remote named `upstream` pointing to the canonical repository:
```bash
git remote add upstream https://github.com/paypilot-ai/paypilot-ai.git
git remote -v
```
You should see:
```text
origin    https://github.com/YOUR_USERNAME/paypilot-ai.git (fetch & push)
upstream  https://github.com/paypilot-ai/paypilot-ai.git (fetch & push)
```

### Step 4: Keep Your Fork Synchronized
Before starting any new work, always pull the latest changes from `upstream/main`:
```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### Step 5: Create a Feature Branch
Create a descriptive branch for your module:
```bash
# Branch naming convention: feature/<module-name>-<short-description>
git checkout -b feature/invoices-line-item-calculator
```

### Step 6: Install Dependencies & Develop
```bash
npm install
npm run dev
```
- Work within your designated module directory (see [`docs/MODULE_GUIDE.md`](./MODULE_GUIDE.md)).
- Adhere strictly to the contracts in [`docs/API_CONTRACTS.md`](./API_CONTRACTS.md).

### Step 7: Run Quality Checks & Tests
Ensure all unit tests and linters pass before committing:
```bash
# Run all tests across frontend and backend
npm test

# Run code style/linting checks
npm run lint
```

### Step 8: Commit & Push to Your Fork
```bash
git add .
git commit -m "feat(invoices): implement line-item subtotal and tax calculation"
git push origin feature/invoices-line-item-calculator
```

### Step 9: Open a Pull Request
1. Navigate to the canonical repository on GitHub.
2. You will see a banner to **Compare & pull request** from your fork.
3. Fill out the PR template completely:
   - Module affected
   - Brief summary of changes
   - Testing steps and evidence
   - Breaking change / migration considerations
4. Submit the pull request for review.

---

## 2. Fork Synchronization Cheat Sheet

If other teammates merge code into `upstream/main` while you are working on your feature branch:

```bash
# Fetch latest upstream commits
git fetch upstream

# Rebase your feature branch on top of upstream/main
git checkout feature/your-branch
git rebase upstream/main

# If conflicts occur, resolve them, then:
git add <resolved-files>
git rebase --continue

# Push updated branch to your fork
git push origin feature/your-branch --force-with-lease
```

---

## 3. Pull Request Review Checklist

Before your PR can be approved:
- [ ] Code strictly honors [`docs/API_CONTRACTS.md`](./API_CONTRACTS.md).
- [ ] No hardcoded secrets, API keys, or live PayPal credentials committed.
- [ ] Unit tests added in `tests/` for new logic.
- [ ] All CI checks pass (`npm test`, `npm run lint`).
- [ ] Any schema modification includes a numbered migration file in `database/migrations/`.
- [ ] Follows monetary rule: all currency amounts stored and handled with 2 decimal precision.
