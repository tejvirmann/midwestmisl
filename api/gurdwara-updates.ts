import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit } from "@octokit/rest";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    const githubRepo = process.env.GITHUB_REPO || "tejvirmann/midwestmisl";
    const [owner, repo] = githubRepo.split("/");

    if (!githubToken) {
      console.warn("GITHUB_TOKEN not set, skipping PR creation");
      return res.json({
        message: "Update received. PR creation skipped (GitHub token not configured).",
        success: true,
      });
    }

    const octokit = new Octokit({ auth: githubToken });

    // Get current file content from GitHub
    let currentData: any;
    let fileSha: string | undefined;
    const filePath = "gurdwara_data.json";
    
    // Try to detect the default branch
    let mainBranch = "main";
    try {
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      mainBranch = repoData.default_branch;
    } catch (error) {
      console.warn("Could not detect default branch, using 'main'");
    }

    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: mainBranch,
      });

      if ("content" in fileData && fileData.encoding === "base64") {
        const content = Buffer.from(fileData.content, "base64").toString("utf-8");
        currentData = JSON.parse(content);
        fileSha = fileData.sha;
      } else {
        // File doesn't exist or is too large
        currentData = { topSikhCities: [], gurdwaras: [] };
      }
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, create new structure matching the expected format
        currentData = { topSikhCities: [], gurdwaras: [] };
        console.log("File not found, will create new file");
      } else {
        console.error("Error reading file from GitHub:", error);
        return res.status(500).json({
          error: "Failed to read current data from repository",
          details: error.message,
        });
      }
    }

    // Generate new Gurdwara entry matching the expected structure
    const newGurdwara = {
      name: formData.gurdwaraName,
      city: formData.city,
      state: formData.stateProvince,
      country: formData.country,
      latitude: null, // Will need geocoding
      longitude: null,
      type: formData.updateType === "missing" ? "Standard" : "Update",
      ...(formData.address && { address: formData.address }),
      ...(formData.details && { notes: formData.details }),
    };

    // Ensure the structure exists
    if (!currentData.gurdwaras) {
      currentData.gurdwaras = [];
    }
    if (!currentData.topSikhCities) {
      currentData.topSikhCities = [];
    }
    
    // Add the new gurdwara
    currentData.gurdwaras.push(newGurdwara);

    // Create a new branch with unique name
    const timestamp = Date.now();
    let branchName = `update-gurdwara-${timestamp}`;

    // Get the latest commit SHA
    let baseSha: string;
    try {
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${mainBranch}`,
      });
      baseSha = refData.object.sha;
    } catch (error: any) {
      console.error("Error getting base branch:", error);
      return res.status(500).json({
        error: "Failed to get base branch",
        details: error.message,
      });
    }

    // Create new branch
    try {
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      });
    } catch (error: any) {
      // Branch might already exist, try with a different name
      if (error.status === 422) {
        const altBranchName = `update-gurdwara-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
        try {
          await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${altBranchName}`,
            sha: baseSha,
          });
          branchName = altBranchName;
        } catch (retryError: any) {
          console.error("Error creating branch:", retryError);
          return res.status(500).json({
            error: "Failed to create branch",
            details: retryError.message,
          });
        }
      } else {
        console.error("Error creating branch:", error);
        return res.status(500).json({
          error: "Failed to create branch",
          details: error.message,
        });
      }
    }

    // Update the JSON file
    const updatedContent = JSON.stringify(currentData, null, 2);

    // Create or update file
    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Update: ${formData.updateType} - ${formData.gurdwaraName}`,
        content: Buffer.from(updatedContent).toString("base64"),
        branch: branchName,
        sha: fileSha, // undefined if file doesn't exist (will create new file)
      });
    } catch (error: any) {
      console.error("Error updating file:", error);
      return res.status(500).json({
        error: "Failed to update file in repository",
        details: error.message,
      });
    }

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

    let pr;
    try {
      const { data: prData } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: prTitle,
        body: prBody,
        head: branchName,
        base: mainBranch,
      });
      pr = prData;
    } catch (error: any) {
      console.error("Error creating pull request:", error);
      return res.status(500).json({
        error: "Failed to create pull request",
        details: error.message,
        note: "The branch and file update may have been created successfully. Please check your repository.",
      });
    }

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
}

