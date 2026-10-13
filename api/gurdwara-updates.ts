import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit } from "@octokit/rest";

const ALLOWED_COUNTRIES = new Set(["USA", "Canada"]);
const ALLOWED_TYPES = new Set(["missing", "incorrect", "closed", "other"]);

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max) : "";

const hits = new Map<string, number[]>();
function isRateLimited(ip: string, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Best-effort per-instance rate limit (serverless instances don't share memory,
  // so also enable Vercel Firewall rate limiting for a hard guarantee).
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many submissions. Please try again later." });
  }

  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    // Honeypot: real users never fill this hidden field.
    if (body.website) {
      return res.json({ success: true, message: "Update received." });
    }

    const formData = {
      updateType: clean(body.updateType, 20),
      gurdwaraName: clean(body.gurdwaraName, 200),
      address: clean(body.address, 300),
      city: clean(body.city, 100),
      stateProvince: clean(body.stateProvince, 100),
      country: clean(body.country, 20),
      details: clean(body.details, 2000),
      email: clean(body.email, 200),
      timestamp: new Date().toISOString(),
    };

    if (
      !formData.gurdwaraName ||
      !formData.city ||
      !formData.stateProvince ||
      !ALLOWED_COUNTRIES.has(formData.country) ||
      !ALLOWED_TYPES.has(formData.updateType)
    ) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return res.status(400).json({ error: "Invalid email" });
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
          });
        }
      } else {
        console.error("Error creating branch:", error);
        return res.status(500).json({
          error: "Failed to create branch",
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
      });
    }

    // Create pull request
    const prTitle = `${formData.updateType === "missing" ? "Add" : "Update"} Gurdwara: ${formData.gurdwaraName}`;
    const esc = (v: string) => v.replace(/[<>@`]/g, (c) => `\\${c}`);
    const prBody = `
## Gurdwara Update Submission

**Type:** ${esc(formData.updateType)}
**Gurdwara Name:** ${esc(formData.gurdwaraName)}
**Location:** ${esc(formData.city)}, ${esc(formData.stateProvince)}, ${esc(formData.country)}
${formData.address ? `**Address:** ${esc(formData.address)}` : ""}

**Details:**
${esc(formData.details)}

${formData.email ? `**Submitted by:** ${esc(formData.email)}` : ""}
**Timestamp:** ${formData.timestamp}
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
    });
  }
}

