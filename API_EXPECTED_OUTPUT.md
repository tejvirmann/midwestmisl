# API Expected Output

## What Happens When You Submit an Update

When you submit the "Update Map" form, here's what should happen:

### Expected Output: ✅

1. **A new branch is created** in `tejvirmann/midwestmisl` repository
   - Branch name: `update-gurdwara-{timestamp}`
   - Example: `update-gurdwara-1703123456789`

2. **The `gurdwara_data.json` file is updated** (or created if it doesn't exist)
   - The new gurdwara entry is added to the `gurdwaras` array
   - File structure is preserved (keeps `topSikhCities` and `gurdwaras` arrays)

3. **A Pull Request is created** with:
   - **Title:** "Add Gurdwara: {Name}" or "Update Gurdwara: {Name}"
   - **Body:** Contains all form details (name, location, address, details, etc.)
   - **Base branch:** `main` (or your default branch)
   - **Head branch:** The newly created branch

4. **Success Response:**
   ```json
   {
     "message": "Update submitted successfully! Pull request created.",
     "prUrl": "https://github.com/tejvirmann/midwestmisl/pull/1",
     "prNumber": 1,
     "success": true
   }
   ```

### Where to Find It

After submission, check:
- **GitHub Repository:** https://github.com/tejvirmann/midwestmisl
- **Pull Requests tab:** You'll see a new PR with your update
- **Branches:** You'll see the new branch created

### Example PR

The PR will look like this:

**Title:** `Add Gurdwara: Guru Nanak Sikh Temple`

**Description:**
```markdown
## Gurdwara Update Submission

**Type:** missing
**Gurdwara Name:** Guru Nanak Sikh Temple
**Location:** Surrey, BC, Canada
**Address:** 123 Main Street

**Details:**
This is a new gurdwara that should be added to the map.

**Submitted by:** user@example.com
**Timestamp:** 2024-01-15T10:30:00.000Z
```

## Troubleshooting 500 Errors

### Common Causes:

1. **File doesn't exist in repo** ✅ FIXED
   - The API now creates the file if it doesn't exist
   - Initial structure: `{ "topSikhCities": [], "gurdwaras": [] }`

2. **GitHub token issues**
   - Check that `GITHUB_TOKEN` is set correctly
   - Verify token has `repo` scope
   - Token must have permission to create branches and PRs

3. **Repository access**
   - Ensure the token has access to `tejvirmann/midwestmisl`
   - Check repository is not private (or token has private repo access)

4. **Branch name conflicts**
   - The API now handles this with unique timestamps
   - If conflict occurs, it tries an alternative name

### How to Debug

1. **Check browser console** for error messages
2. **Check Vercel function logs:**
   - Go to Vercel dashboard → Your project → Functions tab
   - Click on the function to see logs
3. **Test the API directly:**
   ```bash
   curl -X POST http://localhost:5173/api/gurdwara-updates \
     -H "Content-Type: application/json" \
     -d '{
       "gurdwaraName": "Test Gurdwara",
       "city": "Test City",
       "country": "USA",
       "stateProvince": "CA",
       "updateType": "missing",
       "details": "Test submission"
     }'
   ```

## Next Steps After PR is Created

1. **Review the PR** on GitHub
2. **Verify the data** looks correct
3. **Merge the PR** to apply the update
4. **The map will update** once the PR is merged (if you have auto-deployment set up)

## File Structure

The `gurdwara_data.json` file structure:

```json
{
  "topSikhCities": [...],
  "gurdwaras": [
    {
      "name": "Gurdwara Name",
      "city": "City",
      "state": "State/Province",
      "country": "Country",
      "latitude": null,
      "longitude": null,
      "type": "Standard",
      "address": "Optional address",
      "notes": "Optional notes"
    }
  ]
}
```


