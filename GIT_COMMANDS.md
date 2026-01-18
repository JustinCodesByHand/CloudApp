# Common Git Commands Reference

## Repository Setup (Already Done ✅)
```bash
git init                          # Initialize repository
git config user.name "name"       # Set user name
git config user.email "email"     # Set user email
git remote add origin <url>       # Add remote repository
```

## Daily Workflow
```bash
git status                        # Check what changed
git add .                         # Stage all changes
git add <file>                    # Stage specific file
git commit -m "message"           # Commit changes
git push                          # Push to remote
git pull                          # Pull from remote
```

## Viewing History
```bash
git log                           # View all commits (detailed)
git log --oneline                 # View commits (compact)
git log --graph --all --decorate  # View commit tree
git log -p                        # View commits with diffs
git log --stat                    # View commits with file stats
git show <commit>                 # View specific commit
git diff                          # View unstaged changes
git diff --staged                 # View staged changes
```

## Branching
```bash
git branch                        # List local branches
git branch -a                     # List all branches
git branch <name>                 # Create new branch
git checkout <branch>             # Switch to branch
git checkout -b <branch>          # Create and switch to branch
git merge <branch>                # Merge branch into current
git branch -d <branch>            # Delete local branch
```

## Undoing Changes
```bash
git restore <file>                # Discard changes in file
git restore --staged <file>       # Unstage file
git reset HEAD~1                  # Undo last commit (keep changes)
git reset --hard HEAD~1           # Undo last commit (discard changes)
git revert <commit>               # Create new commit reverting changes
```

## Current Repository Status

### Commits
```
49f9b07 - Add comprehensive README documenting project structure and refactoring
f2cfaab - Initial commit: Finance app with refactored React components
```

### Tracked Files (38 total)
- Backend files: app.js, package.json, routes/, views/, etc.
- Frontend files: finance-app/src/, finance-app/package.json, etc.
- Configuration: .gitignore, README.md

### Ignored Files (from .gitignore)
- node_modules/
- .env, .env.local
- dist/, build/
- .vscode/, .idea/
- *.log, npm-debug.log*

## Pushing to GitHub (Optional)

### Create repository on GitHub, then:
```bash
git remote add origin https://github.com/username/Finance.git
git branch -M main              # Rename master to main (optional)
git push -u origin master       # Push and set upstream
```

### Future pushes:
```bash
git push                        # Push to origin
git push origin <branch>        # Push specific branch
```

## Tips

1. **Commit often**: Make small, logical commits
2. **Meaningful messages**: Describe what and why, not what files changed
3. **Branching strategy**: Use feature branches for new work
4. **Before push**: Review changes with `git diff`
5. **Keep it clean**: Don't commit node_modules, .env files, etc.

## Useful Aliases (add to .gitconfig)

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'restore --staged'
git config --global alias.last 'log -1 HEAD'
git config --global alias.graph 'log --graph --oneline --all'
```

Then use: `git st`, `git co`, `git br`, etc.
