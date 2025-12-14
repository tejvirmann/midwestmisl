# GitHub PR Automation Setup

This guide explains how to set up automatic pull request creation when users submit Gurdwara updates.

## Prerequisites

1. A GitHub repository for your project
2. A GitHub Personal Access Token (PAT) with appropriate permissions

## Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Sikh Map PR Automation")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (if you want to trigger GitHub Actions)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file (or your server environment):

```bash
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_REPO=your-username/your-repo-name
```

**Example:**
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=tejvirmann/sikhmap
```

## Step 3: Repository Structure

The automation expects:
- A `gurdwara_data.json` file in the repository root
- A default branch named `main` (or update the code to use `master`)

## How It Works

1. User submits the update form
2. Backend receives the submission
3. Backend creates a new branch: `update-gurdwara-{timestamp}`
4. Backend updates `gurdwara_data.json` with the new entry
5. Backend creates a pull request with:
   - Title: "Add/Update Gurdwara: {name}"
   - Body: All form details
   - Base branch: `main`
   - Head branch: `update-gurdwara-{timestamp}`

## Security Notes

- **Never commit your GitHub token to version control**
- Use environment variables or a secrets manager
- Consider using GitHub App authentication for production (more secure)
- The token should have minimal required permissions

## Troubleshooting

### PR Creation Fails

1. Check that `GITHUB_TOKEN` is set correctly
2. Verify the token has `repo` scope
3. Ensure `GITHUB_REPO` is in the format `owner/repo`
4. Check that the default branch exists (usually `main`)

### File Not Found

- Ensure `gurdwara_data.json` exists in the repository root
- The file path in the code is relative to the repo root

### Branch Already Exists

- This is unlikely with timestamps, but if it happens, the error will be logged
- The system will try to use the existing branch

## Testing

1. Submit a test update through the form
2. Check your GitHub repository for the new branch and PR
3. Review the PR to ensure data is formatted correctly
4. Merge the PR to apply the update

## Production Considerations

For production, consider:
- Adding validation before PR creation
- Implementing rate limiting
- Adding email notifications
- Setting up automated PR review/merge workflows
- Using GitHub Actions for additional processing



