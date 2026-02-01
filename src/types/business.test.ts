/**
 * Test file for Business interface type safety
 * Tests for Task Group 1.1: Airtable Schema Updates
 */

import { Business, BuildStatus, AirtableRecord, BuildJob } from './business';

// Test 1: Business interface with new deployment fields
describe('Business Interface Type Safety', () => {
  it('should accept new deployment fields', () => {
    const business: Business = {
      id: 'test-id',
      name: 'Test Business',
      phone: '555-1234',
      email: 'test@example.com',
      address: '123 Main St',
      rating: 5,
      placeId: 'test-place-id',
      notes: 'Test notes',
      description: 'Test description',
      status: 'New Lead',
      package: 'Starter',
      amount: 100,
      paid: false,
      // New deployment fields
      githubRepo: 'https://github.com/senpapi69/test-business-starter',
      renderServiceId: 'srv-abc123',
      renderDeploymentUrl: 'https://test-business-starter.onrender.com',
      deploymentStatus: 'pending',
    };

    expect(business.githubRepo).toBeDefined();
    expect(business.renderServiceId).toBeDefined();
    expect(business.renderDeploymentUrl).toBeDefined();
    expect(business.deploymentStatus).toBeDefined();
  });

  it('should allow optional deployment fields', () => {
    const business: Business = {
      id: 'test-id',
      name: 'Test Business',
      phone: '555-1234',
      address: '123 Main St',
      rating: 5,
      placeId: 'test-place-id',
      notes: '',
      description: '',
      status: 'New Lead',
      paid: false,
    };

    expect(business.githubRepo).toBeUndefined();
    expect(business.renderServiceId).toBeUndefined();
    expect(business.renderDeploymentUrl).toBeUndefined();
    expect(business.deploymentStatus).toBeUndefined();
  });
});

// Test 2: AirtableRecord field mappings for new deployment fields
describe('AirtableRecord Field Mappings', () => {
  it('should map Airtable fields to Business interface', () => {
    const airtableRecord: AirtableRecord = {
      id: 'rec123',
      fields: {
        Name: 'Test Business',
        Phone: '555-1234',
        Address: '123 Main St',
        Rating: 5,
        'Place ID': 'test-place-id',
        Notes: 'Test notes',
        Description: 'Test description',
        Status: 'New Lead',
        Package: 'Starter',
        Amount: 100,
        Paid: false,
        // New deployment fields
        'GitHub Repo': 'https://github.com/senpapi69/test-business-starter',
        'Render Service ID': 'srv-abc123',
        'Render Deployment URL': 'https://test-business-starter.onrender.com',
        'Deployment Status': 'pending',
      },
    };

    expect(airtableRecord.fields['GitHub Repo']).toBe('https://github.com/senpapi69/test-business-starter');
    expect(airtableRecord.fields['Render Service ID']).toBe('srv-abc123');
    expect(airtableRecord.fields['Render Deployment URL']).toBe('https://test-business-starter.onrender.com');
    expect(airtableRecord.fields['Deployment Status']).toBe('pending');
  });
});

// Test 3: BuildStatus enum with new statuses
describe('BuildStatus Enum', () => {
  it('should accept new deployment statuses', () => {
    const statuses: BuildStatus[] = [
      'queued',
      'building',
      'github-creating',
      'render-provisioning',
      'auto-deploying',
      'live',
      'error',
    ];

    statuses.forEach((status) => {
      expect(['queued', 'building', 'github-creating', 'render-provisioning', 'auto-deploying', 'live', 'error'] as BuildStatus[]).toContain(status);
    });
  });
});

// Test 4: BuildJob interface with new deployment fields
describe('BuildJob Interface', () => {
  it('should accept new deployment metadata fields', () => {
    const buildJob: BuildJob = {
      id: 'build-123',
      businessId: 'test-business-id',
      businessName: 'Test Business',
      package: 'Starter',
      amount: 100,
      status: 'github-creating',
      paymentStatus: 'pending',
      triggeredAt: new Date(),
      previewUrl: 'https://lovable.dev/test',
      // New deployment metadata fields
      githubRepo: 'https://github.com/senpapi69/test-business-starter',
      renderServiceId: 'srv-abc123',
      renderDeploymentUrl: 'https://test-business-starter.onrender.com',
      deploymentStatus: 'pending',
    };

    expect(buildJob.githubRepo).toBeDefined();
    expect(buildJob.renderServiceId).toBeDefined();
    expect(buildJob.renderDeploymentUrl).toBeDefined();
    expect(buildJob.deploymentStatus).toBeDefined();
  });

  it('should allow optional deployment metadata fields', () => {
    const buildJob: BuildJob = {
      id: 'build-123',
      businessId: 'test-business-id',
      businessName: 'Test Business',
      package: 'Starter',
      amount: 100,
      status: 'queued',
      paymentStatus: 'pending',
      triggeredAt: new Date(),
    };

    expect(buildJob.githubRepo).toBeUndefined();
    expect(buildJob.renderServiceId).toBeUndefined();
    expect(buildJob.renderDeploymentUrl).toBeUndefined();
    expect(buildJob.deploymentStatus).toBeUndefined();
  });
});
