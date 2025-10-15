# n8n Workflow Setup Instructions

## Overview

This guide walks you through importing and configuring the n8n workflows for the Vapi lead qualification demo.

## Prerequisites

- Access to n8n instance: https://dan-vapi.app.n8n.cloud/
- Vapi API key: `35fa19b1-8078-43c4-9f29-0093a3e223fd`
- Basic understanding of n8n nodes

## Workflow 1: Lead Capture

This workflow receives form submissions, stores lead data, and initiates the Vapi call.

### Import Steps

1. **Log into n8n**
   - Navigate to https://dan-vapi.app.n8n.cloud/
   - Go to "Workflows" in the sidebar

2. **Import Workflow**
   - Click "Add workflow" → "Import from File"
   - Select `/n8n-workflows/lead-capture-workflow.json`
   - Click "Import"

3. **Configure Webhook Node**
   - Click on the "Webhook" node
   - Note the webhook URL (e.g., `https://dan-vapi.app.n8n.cloud/webhook/lead-capture`)
   - Set HTTP Method to `POST`
   - Set Response Mode to `Using 'Respond to Webhook' Node`

4. **Update Vapi API Key**
   - Click on "Vapi - Create Call" HTTP Request node
   - In the Headers section, update the Authorization value:
     ```
     Bearer 35fa19b1-8078-43c4-9f29-0093a3e223fd
     ```
   - Or create a credential for Vapi API

5. **Customize Assistant Prompt (Optional)**
   - In the "Vapi - Create Call" node
   - Modify the `jsonBody` to customize:
     - First message
     - System prompt
     - Voice settings
     - Model parameters

6. **Test the Workflow**
   - Click "Execute Workflow" to enable test mode
   - Use curl to test the webhook:
   ```bash
   curl -X POST https://dan-vapi.app.n8n.cloud/webhook/lead-capture \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "phone": "+1234567890",
       "company": "Test Company",
       "timestamp": "2025-10-14T12:00:00Z"
     }'
   ```

7. **Activate Workflow**
   - Toggle the "Active" switch in the top right
   - Workflow is now live and listening for webhooks

### Node Details

**Webhook Trigger**
- Receives POST requests from Next.js form
- Path: `/lead-capture`
- Returns response via Respond to Webhook node

**Set Lead Data**
- Normalizes incoming data
- Generates unique lead ID
- Sets initial status to "pending_call"

**Vapi - Create Call**
- HTTP POST to https://api.vapi.ai/call
- Creates voice assistant with inline configuration
- Passes customer phone number and metadata

**Format Response**
- Prepares JSON response
- Includes call_id and lead_id
- Sends success message back to form

**Respond to Webhook**
- Returns formatted response to Next.js
- Completes the synchronous flow

## Workflow 2: Vapi Callback

This workflow receives real-time events from Vapi about call status, transcripts, and results.

### Import Steps

1. **Import Workflow**
   - Click "Add workflow" → "Import from File"
   - Select `/n8n-workflows/vapi-callback-workflow.json`
   - Click "Import"

2. **Configure Webhook Node**
   - Click on the "Vapi Webhook" node
   - Note the webhook URL (e.g., `https://dan-vapi.app.n8n.cloud/webhook/vapi-callback`)
   - Set HTTP Method to `POST`

3. **Update Vapi Assistant Settings**
   - Log into Vapi dashboard
   - Edit your assistant
   - Set Server URL to: `https://dan-vapi.app.n8n.cloud/webhook/vapi-callback`
   - This tells Vapi where to send events

4. **Add CRM Integration (Optional)**
   - After "Extract Call Data" node, add:
     - **Airtable** node to store results
     - **Google Sheets** node to log calls
     - **Slack** node to notify team
     - **Email** node to send summaries

5. **Test the Workflow**
   - Click "Execute Workflow"
   - Make a test call through Workflow 1
   - Watch for incoming webhook events

6. **Activate Workflow**
   - Toggle "Active" switch
   - Workflow now receives all Vapi events

### Node Details

**Vapi Webhook**
- Receives POST requests from Vapi
- Events include: call started, transcript, call ended, etc.

**Switch on Event Type**
- Routes different event types
- Three outputs:
  1. end-of-call-report
  2. transcript
  3. status-update

**Extract Call Data**
- Parses end-of-call-report
- Extracts: call_id, lead_id, duration, transcript, summary
- Ready to store in CRM

**Extract Transcript**
- Parses real-time transcript events
- Captures: role (user/assistant), text

**Log for Demo**
- Placeholder for CRM integration
- Replace with actual database write

## Adding CRM Integration

### Airtable Example

1. **Add Airtable Node**
   - Click "+" after "Extract Call Data"
   - Search for "Airtable"
   - Select "Airtable"

2. **Configure Airtable**
   - Operation: "Update" (to update existing lead record)
   - Base: Your Airtable base
   - Table: "Leads"
   - Record ID: `{{ $('Set Lead Data').item.json.lead_id }}`
   - Fields to Update:
     - Call Status: `{{ $json.status }}`
     - Call Duration: `{{ $json.duration }}`
     - Transcript: `{{ $json.transcript }}`
     - Summary: `{{ $json.summary }}`

### Google Sheets Example

1. **Add Google Sheets Node**
   - Click "+" after "Extract Call Data"
   - Search for "Google Sheets"
   - Select "Google Sheets"

2. **Configure Google Sheets**
   - Operation: "Append or Update"
   - Document: Your spreadsheet
   - Sheet: "Lead Calls"
   - Data to Send:
     - Column A: `{{ $json.lead_id }}`
     - Column B: `{{ $json.status }}`
     - Column C: `{{ $json.duration }}`
     - Column D: `{{ $json.transcript }}`

### Slack Example

1. **Add Slack Node**
   - Click "+" after "Extract Call Data"
   - Search for "Slack"
   - Select "Slack"

2. **Configure Slack**
   - Operation: "Post Message"
   - Channel: "#new-leads"
   - Message:
   ```
   New lead qualified! 🎉
   Name: {{ $('Set Lead Data').item.json.name }}
   Company: {{ $('Set Lead Data').item.json.company }}
   Status: {{ $json.status }}
   Duration: {{ $json.duration }}s
   ```

## Webhook URLs Reference

After importing, your webhook URLs will be:

**Lead Capture:**
```
https://dan-vapi.app.n8n.cloud/webhook/lead-capture
```

**Vapi Callback:**
```
https://dan-vapi.app.n8n.cloud/webhook/vapi-callback
```

Update these in:
1. Next.js `.env.local` → `N8N_WEBHOOK_URL`
2. Vapi assistant settings → "Server URL"

## Testing the Complete Flow

### End-to-End Test

1. **Activate Both Workflows**
   - Lead Capture: Active ✓
   - Vapi Callback: Active ✓

2. **Submit Form**
   - Go to http://localhost:3000
   - Fill out form with your phone number
   - Submit

3. **Monitor n8n**
   - Open both workflows
   - Watch "Lead Capture" execute
   - Watch "Vapi Callback" receive events

4. **Answer Call**
   - Phone should ring within 30-60 seconds
   - Have conversation with AI
   - End call

5. **Verify Callback**
   - Check "Vapi Callback" execution
   - Verify transcript was captured
   - Verify call data is complete

### Test with curl

**Test Lead Capture:**
```bash
curl -X POST https://dan-vapi.app.n8n.cloud/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "company": "Example Corp",
    "timestamp": "2025-10-14T20:00:00Z"
  }'
```

**Test Vapi Callback:**
```bash
curl -X POST https://dan-vapi.app.n8n.cloud/webhook/vapi-callback \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "message": {
        "type": "end-of-call-report"
      },
      "call": {
        "id": "test-123",
        "status": "ended",
        "metadata": {
          "lead_id": "12345"
        }
      }
    }
  }'
```

## Troubleshooting

### Workflow Not Executing

**Check:**
- Is workflow activated?
- Is webhook URL correct?
- Are there any errors in execution logs?

**Fix:**
- Toggle workflow off and on
- Re-import workflow
- Check n8n console for errors

### Vapi API Call Fails

**Check:**
- Is API key correct?
- Is Vapi account active?
- Is there credit balance?

**Fix:**
- Update Authorization header
- Check Vapi dashboard for account status
- Top up account balance

### Callback Not Receiving Data

**Check:**
- Is callback workflow activated?
- Is Server URL set in Vapi assistant?
- Is webhook URL publicly accessible?

**Fix:**
- Verify Server URL in Vapi dashboard
- Test webhook with curl
- Check n8n logs for incoming requests

## Advanced Configuration

### Error Handling

Add error handling to workflows:

1. **Add Error Trigger**
   - Create new workflow
   - Add "Error Trigger" node
   - Add Slack/Email notification
   - Link to main workflow

2. **Add Try-Catch Logic**
   - Use IF nodes to check for errors
   - Route failures to notification node
   - Log errors for debugging

### Rate Limiting

If you expect high volume:

1. **Add Queue**
   - Use n8n's Queue mode
   - Prevents overwhelming Vapi API
   - Ensures sequential processing

2. **Add Delays**
   - Insert Wait node between calls
   - Prevents rate limit hits
   - Smooth out traffic spikes

### Data Validation

Add validation before calling Vapi:

1. **Add Function Node**
   ```javascript
   const phone = $json.phone;
   const phoneRegex = /^\+[1-9]\d{1,14}$/;
   
   if (!phoneRegex.test(phone)) {
     throw new Error('Invalid phone number format');
   }
   
   return items;
   ```

2. **Add IF Node**
   - Check required fields exist
   - Route invalid data to error handler
   - Ensures clean data to Vapi

## Monitoring

### View Execution History

- Go to "Executions" in sidebar
- Filter by workflow name
- Click on execution to see details

### Set Up Alerts

- Create error trigger workflow
- Send notifications on failure
- Monitor key metrics (response time, success rate)

## Need Help?

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Vapi Documentation: https://docs.vapi.ai
- This project's README: `/README.md`

