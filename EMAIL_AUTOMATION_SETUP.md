# Email Automation Setup Guide

This guide will help you set up automated email workflows for your Ghost Hunter Dashboard.

## Overview

The dashboard includes email functionality for:
- Sending invoices with Stripe payment links
- Quick outreach to prospects
- Automated follow-ups
- Payment confirmations

## Prerequisites

- n8n webhook endpoint (already configured)
- Email service provider (Gmail, SendGrid, Mailgun, etc.)
- Stripe account for payment processing

## Setup Steps

### 1. Email Service Configuration

You have several options for sending emails:

#### Option A: Gmail (Simple but limited)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Configure your n8n workflow to use Gmail SMTP:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail address
   - Password: Your app password

#### Option B: SendGrid (Recommended for production)
1. Sign up at https://sendgrid.com
2. Verify your sender domain
3. Create an API key
4. Configure n8n to use SendGrid API

#### Option C: Mailgun
1. Sign up at https://mailgun.com
2. Verify your domain
3. Get your API key and domain
4. Configure n8n workflow

### 2. n8n Workflow Setup

The dashboard sends emails to: `VITE_N8N_EMAIL_WEBHOOK_URL`

Current webhook: `https://n8n.hudsond.me/webhook/send-email`

Your n8n workflow should:
1. Receive POST request with:
   ```json
   {
     "to": "customer@example.com",
     "subject": "Invoice for Business Name",
     "message": "Email body...",
     "businessName": "Business Name",
     "type": "email"
   }
   ```
2. Send email using your configured email service
3. Return success/failure response

### 3. Email Templates

The dashboard includes templates for:

#### Invoice Email (EmailInvoice component)
- Automatically includes package details
- Stripe payment link
- Professional formatting

#### Quick Outreach (QuickOutreach component)
- Initial contact template
- Follow-up template
- Demo ready template
- Custom template option

### 4. Automation Ideas

Set up these automated workflows:

#### A. Payment Confirmation Email
- Trigger: Stripe webhook (payment success)
- Action: Send thank you email + next steps

#### B. Follow-up Sequence
- Day 0: Send invoice
- Day 3: Follow-up if not paid
- Day 7: Final reminder
- Use n8n's "Wait" node for delays

#### C. Post-Payment Onboarding
- Send welcome email
- Send project timeline
- Send feedback request after completion

#### D. Abandoned Invoice Reminder
- Track invoices sent but not paid
- Auto-send reminder after X days

### 5. n8n Workflow Example

Here's a basic n8n workflow structure:

```
[Webhook] → [Switch: Email Type] → [Email Service]
                                  → [Database Log]
                                  → [Response]
```

Nodes to use:
1. **Webhook** - Receives request from dashboard
2. **Switch** - Routes based on email type (invoice, outreach, etc.)
3. **Gmail/SendGrid/Mailgun** - Sends the email
4. **Database** (optional) - Log sent emails
5. **Respond to Webhook** - Return success/failure

### 6. Testing

Test your email automation:

1. In the dashboard, click "Email Invoice"
2. Select a package
3. Enter a test email address
4. Click "Send Invoice"
5. Check:
   - Email received
   - Formatting looks good
   - Links work correctly
   - Stripe payment link is valid

### 7. Environment Variables

Make sure these are set in your `.env`:

```bash
# Email webhook endpoint
VITE_N8N_EMAIL_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-email

# Stripe configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
```

### 8. Stripe Payment Links Setup

Create payment links in Stripe Dashboard:

1. Go to https://dashboard.stripe.com/payment-links
2. Create links for each package:
   - Starter: $100
   - Business: $300
   - Premium: $500
   - Enterprise: $800

3. Update `src/lib/stripe.ts` with your payment link URLs

Example:
```typescript
const paymentLinks = {
  'Starter': 'https://buy.stripe.com/abc123',
  'Business': 'https://buy.stripe.com/def456',
  'Premium': 'https://buy.stripe.com/ghi789',
  'Enterprise': 'https://buy.stripe.com/jkl012',
};
```

### 9. Advanced: Webhook Handlers

For automated workflows, set up webhook handlers:

#### Stripe Webhook
```javascript
// Receives payment success events
// Triggers: payment.succeeded
// Actions:
// - Update Airtable
// - Send confirmation email
// - Start build process
```

#### Email Status Webhook
```javascript
// Track email delivery status
// Events: delivered, opened, clicked, bounced
// Actions:
// - Log in database
// - Update lead score
// - Trigger follow-ups
```

### 10. Monitoring & Analytics

Track these metrics:
- Emails sent per day
- Open rates
- Click-through rates (payment links)
- Conversion rates (invoice → payment)

Use n8n's built-in execution logs or integrate with:
- Google Analytics
- Mixpanel
- Custom dashboard

## Troubleshooting

### Email not sending
1. Check n8n workflow execution logs
2. Verify webhook URL is correct
3. Check email service credentials
4. Test with curl:
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/send-email \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com","subject":"Test","message":"Hello"}'
   ```

### Emails going to spam
1. Set up SPF, DKIM, DMARC records
2. Use a verified sender domain
3. Avoid spam trigger words
4. Keep email clean and professional

### Payment links not working
1. Verify links in Stripe dashboard
2. Check links are in test/live mode correctly
3. Ensure links are active

## Next Steps

1. Set up your n8n workflow
2. Configure email service
3. Create Stripe payment links
4. Test end-to-end flow
5. Set up automated sequences
6. Monitor and optimize

## Support

For help:
- n8n docs: https://docs.n8n.io
- Stripe docs: https://stripe.com/docs
- Email provider docs
