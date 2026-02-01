# Airtable Schema Changes for GitHub to Render Auto-Deploy

## Overview
This document describes the Airtable schema changes required for the GitHub to Render auto-deploy integration feature.

## Base Information
- **Base ID**: `appR5KcaSGMEwnZ6r`
- **Table Name**: Business
- **Table ID**: `tblnE3lsJkorUaAkL`

## New Fields to Add

### 1. GitHub Repo
- **Field Type**: Single line text
- **Field Name**: `GitHub Repo`
- **Purpose**: Store full GitHub repository URL
- **Example Value**: `https://github.com/senpapi69/joes-pizza-starter`
- **Required**: No
- **Unique**: No

### 2. Render Service ID
- **Field Type**: Single line text
- **Field Name**: `Render Service ID`
- **Purpose**: Store Render service ID for status tracking and API calls
- **Example Value**: `srv-abc123xyz`
- **Required**: No
- **Unique**: No

### 3. Render Deployment URL
- **Field Type**: Single line text (URL format validation recommended)
- **Field Name**: `Render Deployment URL`
- **Purpose**: Store live website URL on Render
- **Example Value**: `https://joes-pizza-starter.onrender.com`
- **Required**: No
- **Unique**: No

### 4. Deployment Status
- **Field Type**: Single select
- **Field Name**: `Deployment Status`
- **Purpose**: Track current deployment state
- **Options**:
  - `pending` - Initial state, waiting for deployment to start
  - `deploying` - Deployment in progress
  - `live` - Deployment successful, site is live
  - `failed` - Deployment failed
- **Default Value**: `pending`
- **Required**: No

## Field Mapping to TypeScript Interfaces

The Airtable fields map to TypeScript interfaces in `src/types/business.ts`:

```typescript
// Business interface
export interface Business {
  // ... existing fields
  githubRepo?: string;              // Maps to 'GitHub Repo'
  renderServiceId?: string;          // Maps to 'Render Service ID'
  renderDeploymentUrl?: string;      // Maps to 'Render Deployment URL'
  deploymentStatus?: 'pending' | 'deploying' | 'live' | 'failed';  // Maps to 'Deployment Status'
}

// AirtableRecord interface
export interface AirtableRecord {
  id: string;
  fields: {
    // ... existing fields
    'GitHub Repo'?: string;
    'Render Service ID'?: string;
    'Render Deployment URL'?: string;
    'Deployment Status'?: string;
  };
}

// BuildJob interface (for deployment tracking)
export interface BuildJob {
  // ... existing fields
  githubRepo?: string;
  renderServiceId?: string;
  renderDeploymentUrl?: string;
  deploymentStatus?: 'pending' | 'deploying' | 'live' | 'failed';
}
```

## Manual Setup Steps

### Step 1: Open Airtable Base
1. Navigate to https://airtable.com
2. Open base `appR5KcaSGMEwnZ6r`
3. Select the Business table (`tblnE3lsJkorUaAkL`)

### Step 2: Add Fields
For each field listed above:
1. Click the "+" button to add a new field
2. Select the appropriate field type
3. Enter the field name exactly as specified
4. Configure options (if applicable)
5. Click "Create field"

### Step 3: Verify Fields
After adding all fields, verify the table has the following new columns:
- GitHub Repo (text)
- Render Service ID (text)
- Render Deployment URL (text)
- Deployment Status (single select)

## Integration with n8n Workflows

These fields will be updated by n8n workflows:

1. **GitHub Repo Creation Workflow** (`/webhook/create-github-repo`):
   - Updates `GitHub Repo` field with repository URL
   - Sets `Deployment Status` to `pending`

2. **Render Service Provisioning Workflow** (`/webhook/github-render-deploy`):
   - Updates `Render Service ID` field with service ID from API
   - Updates `Render Deployment URL` field with deployment URL
   - Sets `Deployment Status` to `deploying`

3. **Status Update Workflow**:
   - Updates `Deployment Status` to `live` or `failed` based on deployment result
   - Updates `Render Deployment URL` when deployment completes

## Notes

- All fields are optional to maintain backward compatibility with existing records
- Field names follow PascalCase with spaces (Airtable convention)
- TypeScript interfaces use camelCase for JavaScript conventions
- The mapping between Airtable field names and TypeScript interfaces is handled in the data layer

## Verification

To verify the schema is correctly set up:
1. Open the Business table in Airtable
2. Check that all 4 new fields are visible
3. Create a test record and populate the fields
4. Verify field types and constraints match the specification

## Status

**Task Group 1 Status**: ✅ Complete

- [x] 1.1 - Tests written for Business interface type safety
- [x] 1.2 - `githubRepo` field added to Business interface
- [x] 1.3 - `renderServiceId` field added to Business interface
- [x] 1.4 - `renderDeploymentUrl` field added to Business interface
- [x] 1.5 - `deploymentStatus` field added to Business interface
- [x] 1.6 - Business interface updated in `/src/types/business.ts`
- [x] 1.7 - AirtableRecord interface updated
- [x] 1.8 - BuildStatus type updated with new statuses
- [x] 1.9 - BuildJob interface updated
- [x] 1.10 - TypeScript compilation verified

**Next Step**: Manual verification in Airtable UI to confirm fields exist in base `appR5KcaSGMEwnZ6r` table `tblnE3lsJkorUaAkL`
