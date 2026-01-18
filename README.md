# Finance App - Git Repository

## Repository Overview

This repository contains a full-stack finance application with a refactored React frontend and Node.js/Express backend.

### Initial Commit (f2cfaab)
**Finance app with refactored React components**

All source code has been organized into a git repository with a clean project structure and comprehensive gitignore configuration.

---

## VS Code Integration

This project is fully configured for Visual Studio Code development with:

### Quick Start with VS Code
```bash
# Open the workspace
code CloudApp.code-workspace

# Or open the folder directly
code .
```

### Features Configured
- ✅ **Editor Settings**: Auto-format on save, consistent line endings
- ✅ **Git Integration**: Auto-fetch, smart commits, recommended GitLens extension
- ✅ **Debug Configurations**: Launch backend, frontend, or full-stack debugging
- ✅ **Task Automation**: Quick commands for dev servers, builds, and testing
- ✅ **Recommended Extensions**: Prettier, ESLint, Tailwind CSS, React snippets

### Files Included
```
.vscode/
├── settings.json        # Project-specific editor settings
├── extensions.json      # Recommended extensions list
├── launch.json          # Debug configurations for Node.js and Chrome
└── tasks.json          # Automated tasks (start servers, build, install)
CloudApp.code-workspace  # Multi-folder workspace file
```

See [GIT_PUSH_TEST.md](./GIT_PUSH_TEST.md) for detailed VS Code usage instructions.

---

## Project Structure

```
Finance/
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
│
├── Backend (Node.js/Express)
├── app.js                         # Express server entry point
├── package.json                   # Backend dependencies
├── bin/www                        # Server executable
├── routes/                        # API routes
│   ├── index.js
│   └── users.js
├── views/                         # Server-side views
├── public/                        # Static files
├── test-*.js                      # Test files
└── cors-diagnostic.js             # CORS testing
│
└── Frontend (React/Vite)
    └── finance-app/
        ├── .env.local             # Environment variables
        ├── vite.config.js         # Vite configuration
        ├── package.json           # Frontend dependencies
        ├── index.html             # HTML entry point
        │
        └── src/
            ├── main.jsx           # React DOM render
            ├── App.jsx            # Main app component
            ├── App.css
            ├── index.css
            │
            ├── Components/        # React components
            │   ├── TransactionsTable.jsx        # Main container (refactored)
            │   ├── TransactionForm.jsx         # Form component (NEW)
            │   ├── TransactionTableDisplay.jsx # Table display (NEW)
            │   ├── ReceiptScanner.jsx          # OCR scanner (NEW)
            │   ├── Toast.jsx                   # Notifications (NEW)
            │   ├── EnhancedDashboard.jsx
            │   ├── Login.jsx
            │   ├── Registration.jsx
            │   └── ProtectedRoute.jsx
            │
            ├── hooks/             # Custom React hooks (NEW)
            │   └── index.js
            │       ├── useTransactions()       # Transaction management
            │       ├── useTransactionForm()    # Form state
            │       ├── useOCR()               # OCR processing
            │       └── useToast()             # Notifications
            │
            ├── services/          # API layer (NEW)
            │   └── transactionService.js
            │       ├── Axios interceptors
            │       ├── Request: auto-inject token
            │       ├── Response: error handling
            │       └── Methods: fetch, add, AI advice
            │
            ├── utils/             # Utility functions (NEW)
            │   └── transactionUtils.js
            │       ├── parseReceiptText()
            │       ├── parseTotalAmount()
            │       ├── parseReceiptDate()
            │       ├── detectStoreAndType()
            │       ├── formatDate()
            │       └── validateTransaction()
            │
            ├── constants/         # Constants (NEW)
            │   └── transactionConstants.js
            │       ├── API config & endpoints
            │       ├── Categories & types
            │       ├── Store patterns (45+ retailers)
            │       ├── Regex patterns
            │       ├── Keyword categories
            │       └── Configuration values
            │
            └── assets/
                └── react.svg
```

---

## Refactoring Summary

### Before: Monolithic Architecture
- **TransactionsTable.jsx**: 1,114 lines (all logic in one component)
- Hard-coded API URLs throughout
- Direct DOM manipulation (`document.createElement()`)
- Scattered state management
- Duplicate code
- Difficult to test and maintain

### After: Modular Architecture

#### 1. **Component Split**
- `TransactionsTable.jsx` → 1 container + 3 presentational components
- `TransactionForm.jsx` → Form handling
- `TransactionTableDisplay.jsx` → Table display
- `ReceiptScanner.jsx` → OCR interface
- `Toast.jsx` → React-based notifications

#### 2. **API Service Layer**
- Centralized API calls in `transactionService.js`
- Axios request/response interceptors
- Automatic token injection
- Global error handling
- Environment-based configuration

#### 3. **Custom Hooks**
- `useTransactions()` → Fetch & manage transactions
- `useTransactionForm()` → Form state & validation
- `useOCR()` → OCR state management
- `useToast()` → Notification system

#### 4. **Utilities & Constants**
- Receipt parsing logic extracted to `transactionUtils.js`
- All hardcoded values moved to `transactionConstants.js`
- Reusable formatting functions
- Centralized configuration

#### 5. **No DOM Manipulation**
- Removed `document.createElement()` calls
- Replaced with React state & components
- Automatic cleanup with `useEffect`
- No memory leaks

---

## Key Technologies

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **AWS Bedrock** - AI/ML services
- **Tesseract.js** - OCR (server-side bundling)

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tesseract.js** - OCR processing

---

## Git Workflow

### Initial Setup
```bash
git init
git config user.name "JustinCodesByHand"
git config user.email "jcmacey2003@gmail.com"
git add -A
git commit -m "Initial commit: ..."
```

### Current Status
- **Repository**: Initialized and clean
- **Branch**: `master`
- **Latest Commit**: `f2cfaab` - Initial commit with full refactoring
- **Files Tracked**: 38 files
- **Total Changes**: 4,252 insertions

### Viewing History
```bash
git log --oneline           # View all commits
git log --stat              # See file changes
git log -p                  # See full diffs
git show <commit-hash>      # View specific commit
```

### Future Workflow
```bash
# Make changes
git status                  # See what changed
git add .                   # Stage changes
git commit -m "description" # Commit

# Branching
git branch feature-name     # Create feature branch
git checkout feature-name   # Switch to branch
git merge feature-name      # Merge into master
```

---

## Environment Configuration

### Backend (.env in root)
```bash
DATABASE_URL=postgresql://user:pass@localhost/finance
JWT_SECRET=your-secret-key
AWS_REGION=us-east-1
```

### Frontend (finance-app/.env.local)
```bash
VITE_API_BASE_URL=http://localhost:5000
```

---

## Development Workflow

### Backend
```bash
npm install                 # Install dependencies
npm start                   # Production server
npm run dev                 # Development with nodemon
npm run test-db             # Test database connection
npm run test-lambda         # Test AWS Lambda
```

### Frontend
```bash
cd finance-app
npm install
npm run dev                 # Start dev server (Vite)
npm run build               # Production build
npm run preview             # Preview production build
```

---

## Refactoring Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Main Component** | 1,114 lines | 130 lines + split components |
| **Files** | 1 monolithic | 8 focused files |
| **Reusability** | Low | High (hooks, utils, services) |
| **Testability** | Difficult | Easy (pure functions & hooks) |
| **DOM Manipulation** | Direct (`document.*`) | React-managed |
| **API Calls** | Scattered | Centralized service |
| **Error Handling** | Basic | Comprehensive |
| **Maintenance** | Hard | Easy |

---

## Next Steps

1. **Set up remote**: `git remote add origin <github-url>`
2. **Push to GitHub**: `git push -u origin master`
3. **Create feature branches** for new features
4. **Implement CI/CD** (GitHub Actions, etc.)
5. **Add tests** (Jest, React Testing Library)
6. **Documentation** (JSDoc comments, API docs)

---

## License

(Add your license here)

---

## Contact

Developed by: JustinCodesByHand  
Email: jcmacey2003@gmail.com
