# GitHub Push Checklist

Use these steps to publish the `work` branch updates to GitHub so they show up in the remote repository:

1. **Authenticate** – ensure your git user/email are configured and you have access to the GitHub remote.
2. **Pull latest** – `git pull origin work` to sync any new commits from GitHub.
3. **Run tests (optional but recommended)** – from the project root run:
   - `cd backend && npm test -- --runInBand`
4. **Push** – from the project root execute:
   - `git push origin work`
5. **Open PR (if needed)** – create a PR on GitHub from `work` to your main branch and review the diff.

If the push is rejected due to new upstream commits, pull/rebase, resolve any merge conflicts, and repeat step 4.
