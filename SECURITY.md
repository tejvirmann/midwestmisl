# Security Guidelines

## 🔒 Protecting Your Secrets

**CRITICAL:** Never commit API keys, tokens, or passwords to Git!

## ✅ Safe Storage Locations

### 1. Local Development
Store secrets in `.env.local` files (gitignored):
- `client/.env.local` - Frontend environment variables
- `.env.local` - Root level environment variables

### 2. Vercel Deployment
Store secrets in Vercel Environment Variables:
- Go to Vercel Dashboard → Settings → Environment Variables
- Add variables there (never in code or documentation)

## ❌ Never Commit

- API keys (Google Maps, etc.)
- GitHub tokens
- Database passwords
- Any secrets or credentials

## ✅ What's Protected

The following files are in `.gitignore` and will NOT be committed:
- `.env.local`
- `.env*.local`
- `**/.env.local` (any subdirectory)
- `client/.env.local`

## 🚨 If You Accidentally Committed Secrets

1. **Rotate the secrets immediately:**
   - Generate new API keys
   - Create new GitHub tokens
   - Revoke old credentials

2. **Remove from Git history:**
   ```bash
   # Remove file from history (use with caution)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (coordinate with team):**
   ```bash
   git push origin --force --all
   ```

## 📋 Checklist Before Committing

- [ ] No `.env` files in staging
- [ ] No API keys in code
- [ ] No tokens in documentation
- [ ] All secrets use placeholders (`your_key_here`)
- [ ] `.gitignore` includes all `.env` patterns

## 🔍 Verify Before Pushing

```bash
# Check what will be committed
git status

# Search for potential secrets (run before committing)
grep -r "AIzaSy\|ghp_\|gho_\|ghu_" --exclude-dir=node_modules --exclude="*.md" .
```

If you find any actual secrets, remove them and use placeholders!

