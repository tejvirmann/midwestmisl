import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Octokit } from "@octokit/rest";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json());

  // GitHub API endpoint for creating PRs
  app.post("/api/gurdwara-updates", async (req, res) => {
    try {
      const formData = req.body;

      // Validate required fields
      if (!formData.gurdwaraName || !formData.city || !formData.country) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Get GitHub credentials from environment
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPO || "tejvirmann/sikhmap";
      const [owner, repo] = githubRepo.split("/");

      if (!githubToken) {
        console.warn("GITHUB_TOKEN not set, skipping PR creation");
        return res.json({
          message: "Update received. PR creation skipped (GitHub token not configured).",
          success: true,
        });
      }

      const octokit = new Octokit({ auth: githubToken });

      // Read current gurdwara data
      const dataPath = path.resolve(__dirname, "..", "gurdwara_data.json");
      let currentData;
      try {
        const dataContent = await fs.readFile(dataPath, "utf-8");
        currentData = JSON.parse(dataContent);
      } catch (error) {
        console.error("Error reading gurdwara data:", error);
        return res.status(500).json({
          error: "Failed to read current data",
        });
      }

      // Generate new Gurdwara entry
      const newGurdwara = {
        name: formData.gurdwaraName,
        address: formData.address || "",
        city: formData.city,
        state: formData.stateProvince,
        country: formData.country,
        type: formData.updateType === "missing" ? "Gurdwara" : "Update",
        notes: formData.details,
        latitude: null, // Will need geocoding
        longitude: null,
      };

      // Add to appropriate array (simplified - you may need to adjust based on your data structure)
      if (!currentData.gurdwaras) {
        currentData.gurdwaras = [];
      }
      currentData.gurdwaras.push(newGurdwara);

      // Create a new branch
      const branchName = `update-gurdwara-${Date.now()}`;
      const mainBranch = "main"; // or "master"

      // Get the latest commit SHA
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${mainBranch}`,
      });

      // Create new branch
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });

      // Update the JSON file
      const updatedContent = JSON.stringify(currentData, null, 2);
      const filePath = "gurdwara_data.json";

      // Get file SHA if it exists
      let fileSha;
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branchName,
        });
        if ("sha" in fileData) {
          fileSha = fileData.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
      }

      // Create or update file
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Update: ${formData.updateType} - ${formData.gurdwaraName}`,
        content: Buffer.from(updatedContent).toString("base64"),
        branch: branchName,
        sha: fileSha,
      });

      // Create pull request
      const prTitle = `${formData.updateType === "missing" ? "Add" : "Update"} Gurdwara: ${formData.gurdwaraName}`;
      const prBody = `
## Gurdwara Update Submission

**Type:** ${formData.updateType}
**Gurdwara Name:** ${formData.gurdwaraName}
**Location:** ${formData.city}, ${formData.stateProvince}, ${formData.country}
${formData.address ? `**Address:** ${formData.address}` : ""}

**Details:**
${formData.details}

${formData.email ? `**Submitted by:** ${formData.email}` : ""}
**Timestamp:** ${formData.timestamp || new Date().toISOString()}
      `.trim();

      const { data: pr } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: prTitle,
        body: prBody,
        head: branchName,
        base: mainBranch,
      });

      res.json({
        message: "Update submitted successfully! Pull request created.",
        prUrl: pr.html_url,
        prNumber: pr.number,
        success: true,
      });
    } catch (error: any) {
      console.error("Error creating PR:", error);
      res.status(500).json({
        error: "Failed to create pull request",
        message: error.message,
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
