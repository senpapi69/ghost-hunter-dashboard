# Raw Idea

**Feature: GitHub to Render Auto-Deploy Integration**

**Description:**
Create an automated deployment system that connects GitHub repository creation/updates to Render deployments. When a user inputs a GitHub repository URL into the website automation assistant dashboard, the system should automatically:

1. Accept GitHub repository URL input from the user
2. Store the mapping between business/customer and their GitHub repository
3. Set up automated deployment to Render when the GitHub repo receives updates
4. Track deployment status and display it in the dashboard

**Context:**
- Current system: Lovable AI generates websites → user manually publishes to GitHub → user manually copies GitHub URL → user manually pastes into dashboard → triggers Render deploy
- Desired system: User inputs GitHub repo URL once → automatic Render deployment on any GitHub updates
- Tech stack: React + TypeScript frontend, n8n for webhooks/automation, Airtable for database, Render for hosting
- Existing n8n workflow available: `/github-to-render-auto-provision.json`
