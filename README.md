# Vapi + n8n Lead Generation Demo

> **Live Demo**: AI-powered voice agents that qualify leads instantly, feeding results back into your CRM automatically.

## Overview

This demo showcases the power of combining Vapi's voice AI with n8n's automation platform to create an instant lead qualification system. When a lead submits a form, they receive a phone call within minutes from an AI assistant that qualifies them naturally and stores the results in your CRM.

### The Problem

- Leads fill forms at 2 AM but wait hours or days for follow-up
- Manual qualification calls are expensive and inconsistent
- Hot leads go cold while waiting

### The Solution

- **Instant Response**: Call leads within 2 minutes of form submission
- **24/7 Availability**: Never miss a lead, even on weekends
- **Automated Qualification**: Extract company size, pain points, timeline
- **CRM Integration**: Results flow directly into your database

## Architecture

```
┌─────────────┐      ┌──────────┐      ┌─────────────┐      ┌──────────┐
│  Next.js    │─────▶│   n8n    │─────▶│    Vapi     │─────▶│  Phone   │
│  Web Form   │      │ Workflow │      │  Voice AI   │      │   Call   │
└─────────────┘      └──────────┘      └─────────────┘      └──────────┘
                           │                    │
                           │                    │
                           ▼                    ▼
                     ┌──────────┐         ┌──────────┐
                     │   CRM    │◀────────│ Webhook  │
                     │ (Airtable│         │ Callback │
                     │  Sheets) │         └──────────┘
                     └──────────┘
```

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **react-hook-form** - Form state management
- **zod** - Runtime validation

### Backend
- **n8n** - Visual automation platform
- **Vapi** - Voice AI infrastructure
- **Server Actions** - Next.js server-side logic

## Quick Start

### Prerequisites

- Node.js 18+ (or Bun)
- n8n account (https://dan-vapi.app.n8n.cloud/)
- Vapi account (https://vapi.ai)

### 1. Clone and Install

```bash
cd demo-app
bun install
```

### 2. Configure Environment

Create `.env.local`:

```bash
N8N_WEBHOOK_URL=https://dan-vapi.app.n8n.cloud/webhook/lead-capture
```

### 3. Import n8n Workflows

1. Log into n8n: https://dan-vapi.app.n8n.cloud/
2. Go to Workflows → Import
3. Import `n8n-workflows/lead-capture-workflow.json`
4. Import `n8n-workflows/vapi-callback-workflow.json`
5. Activate both workflows
6. Copy the webhook URLs

### 4. Configure Vapi Assistant

**Option A: Use Inline Assistant (Already Configured)**

The n8n workflow includes an inline assistant definition. Just ensure your Vapi API key is correct in the HTTP Request node.

**Option B: Create Dashboard Assistant**

See detailed instructions in `vapi-config/SETUP-GUIDE.md`

### 5. Run the Demo

```bash
cd demo-app
bun dev
```

Open http://localhost:3000

### 6. Test the Flow

1. Fill out the form with YOUR phone number
2. Submit the form
3. Wait ~30 seconds
4. Answer the call from the AI assistant
5. Check n8n execution logs to see the data flow

## Project Structure

```
vapi-n8n-meetup/
├── demo-app/                    # Next.js application
│   ├── app/
│   │   ├── actions.ts          # Server actions for form submission
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── lead-form.tsx       # Lead capture form
│   ├── lib/
│   │   ├── schemas.ts          # Zod validation schemas
│   │   └── utils.ts            # Utility functions
│   └── package.json
├── n8n-workflows/
│   ├── lead-capture-workflow.json    # Main workflow
│   └── vapi-callback-workflow.json   # Callback handler
├── vapi-config/
│   ├── assistant-config.json   # Vapi assistant settings
│   └── SETUP-GUIDE.md         # Detailed Vapi setup
└── README.md
```

## Demo Script for Meetup

### 1. Introduction (2 min)

**Show the Problem:**
- "Imagine you're a B2B company. A lead fills out your form at 2 AM on Saturday."
- "By Monday morning when your sales team follows up, they've already talked to 3 competitors."
- "Speed matters. But hiring 24/7 sales staff isn't realistic for most companies."

**Introduce the Solution:**
- "What if an AI could call them instantly, qualify them professionally, and feed your CRM?"
- "That's what we built with Vapi and n8n."

### 2. Live Demo (5 min)

**Step 1: Show the Landing Page**
- "This is a standard lead capture form. Nothing fancy."
- "But watch what happens when someone submits it..."

**Step 2: Fill Out Form**
- Use volunteer's phone number (or your own test number)
- Fill out: Name, Email, Phone, Company
- Submit

**Step 3: Show n8n Workflow**
- Open n8n dashboard
- Show the workflow executing in real-time
- Point out: Webhook → Set Data → Call Vapi API → Respond

**Step 4: Take the Call**
- Put phone on speaker
- Have a brief conversation with the AI
- Show natural responses, question handling

**Step 5: Show Results**
- Return to n8n
- Show the callback workflow receiving events
- Show where data would flow to CRM (Airtable/Sheets)

### 3. Technical Walkthrough (3 min)

**Frontend:**
- "Built with Next.js 15, Tailwind, shadcn/ui"
- "Form validation with zod, react-hook-form"
- "Server actions POST to n8n webhook"

**n8n Workflow:**
- "Receives webhook, normalizes data"
- "Calls Vapi API with assistant config"
- "Returns success response"

**Vapi Magic:**
- "Spins up voice agent in < 1 second"
- "Streams to phone via WebRTC"
- "Sends real-time events back via webhook"

### 4. Value Proposition (2 min)

**Metrics:**
- Response time: < 2 minutes (vs. hours/days)
- Availability: 24/7/365
- Cost: ~$0.20 per call vs. $30+ for human
- Consistency: 100% (no bad days)

**Use Cases:**
- Lead qualification
- Appointment scheduling
- Customer support triage
- Surveys and feedback
- Outbound sales campaigns

## Backup Plan (If Live Demo Fails)

### Prepare These Assets:

1. **Pre-recorded Call Video**
   - Record a successful qualification call
   - Show both sides of conversation

2. **Screenshots**
   - Form submission
   - n8n workflow executing
   - Vapi dashboard showing active call
   - Call logs and transcripts

3. **Sample Data**
   - Populate Airtable/Sheets with example leads
   - Show different qualification outcomes

4. **Talking Points PDF**
   - Walk through architecture diagram
   - Explain code snippets
   - Discuss technical decisions

## Extending the Demo

### Add CRM Integration

Replace the "Log for Demo" node in the callback workflow with:

**Airtable:**
```json
{
  "node": "Airtable",
  "operation": "update",
  "table": "Leads",
  "fields": {
    "Call Status": "={{ $json.status }}",
    "Call Duration": "={{ $json.duration }}",
    "Transcript": "={{ $json.transcript }}",
    "Qualification Score": "=..."
  }
}
```

**Google Sheets:**
```json
{
  "node": "Google Sheets",
  "operation": "append",
  "range": "A:G",
  "values": [
    "={{ $json.lead_id }}",
    "={{ $json.status }}",
    "={{ $json.duration }}",
    "={{ $json.transcript }}"
  ]
}
```

### Add Calendar Scheduling

If the lead wants a sales call, integrate Calendly or Google Calendar:

```javascript
// In Vapi assistant, add function calling
{
  "name": "schedule_call",
  "description": "Schedule a 15-min sales call",
  "parameters": {
    "preferred_time": "string",
    "timezone": "string"
  }
}
```

Then in n8n, add Calendar node to create the event.

### Add Email Notifications

Send confirmation email after call:

```json
{
  "node": "Send Email",
  "to": "={{ $json.email }}",
  "subject": "Thanks for your interest!",
  "body": "Hi {{ $json.name }}, great speaking with you. Here's a summary..."
}
```

## API Keys and Credentials

### Vapi Keys:
- **Private Key**: `35fa19b1-8078-43c4-9f29-0093a3e223fd`
- **Public Key**: `b570c87d-3876-47f5-a49c-7799cb41f13d`

### n8n Instance:
- **URL**: https://dan-vapi.app.n8n.cloud/

## Troubleshooting

### Form submission fails
- Check n8n workflow is activated
- Verify webhook URL in `.env.local`
- Check browser console for errors

### Call not received
- Verify phone number format: +1234567890
- Check Vapi account balance
- Test phone can receive calls from unknown numbers

### Poor call quality
- Use lower temperature (0.5) in model config
- Switch to gpt-3.5-turbo for faster responses
- Change voice provider to Deepgram

### Webhook not receiving callbacks
- Verify callback URL in Vapi assistant config
- Check n8n callback workflow is activated
- Test webhook with curl:

```bash
curl -X POST https://dan-vapi.app.n8n.cloud/webhook/vapi-callback \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Resources

- [Vapi Documentation](https://docs.vapi.ai)
- [n8n Documentation](https://docs.n8n.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## License

MIT - Feel free to use this for your own projects!

## Questions?

Built for the San Francisco n8n Meetup - October 14, 2025

Contact: dan@vapi.ai

