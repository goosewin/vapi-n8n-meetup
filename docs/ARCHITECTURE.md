# System Architecture

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LEAD GENERATION SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌───────┐
│   Browser    │      │   Next.js    │      │     n8n      │      │ Vapi  │
│              │      │   Server     │      │   Workflow   │      │  API  │
│  Landing     │─────▶│   Action     │─────▶│   Webhook    │─────▶│ Call  │
│  Page Form   │      │   (POST)     │      │   Trigger    │      │ Agent │
└──────────────┘      └──────────────┘      └──────────────┘      └───────┘
       │                     │                      │                   │
       │                     │                      │                   ▼
       │                     │                      │            ┌─────────────┐
       │                     │                      │            │   Phone     │
       │                     │                      │            │   Network   │
       │                     │                      │            │   (WebRTC)  │
       │                     │                      │            └─────────────┘
       │                     │                      │                   │
       │                     │                      │                   ▼
       │                     │                      │            ┌─────────────┐
       │                     │                      │            │   Lead's    │
       │                     │                      │            │   Phone     │
       │◀────────────────────┘                      │            └─────────────┘
       │   Success Response                         │                   │
       │                                            │                   │
       │                                            │                   │
       │                                            ▼                   │
       │                                     ┌─────────────┐            │
       │                                     │  Callback   │◀───────────┘
       │                                     │  Workflow   │    Events
       │                                     │  (Webhook)  │
       │                                     └─────────────┘
       │                                            │
       │                                            ▼
       │                                     ┌─────────────┐
       │                                     │    CRM      │
       │                                     │  (Airtable, │
       │                                     │   Sheets,   │
       │                                     │  Salesforce)│
       │                                     └─────────────┘
       │
       ▼
┌──────────────┐
│   Success    │
│   Message    │
└──────────────┘
```

## Detailed Component Breakdown

### 1. Frontend Layer (Next.js)

**Technology**:
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui
- TypeScript

**Components**:

```
app/
├── page.tsx                 → Landing page with form
├── actions.ts               → Server action for form submission
└── layout.tsx               → Root layout with metadata

components/
└── lead-form.tsx            → Form with validation and state

lib/
└── schemas.ts               → Zod validation schemas
```

**Data Flow**:
```
User fills form
    ↓
react-hook-form validates (zod schema)
    ↓
onSubmit calls Server Action
    ↓
Server Action POSTs to n8n webhook
    ↓
Success/error response shown to user
```

### 2. Automation Layer (n8n)

**Workflow 1: Lead Capture**

```
┌─────────────┐
│   Webhook   │ ← POST from Next.js
│   Trigger   │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│     Set     │ Normalize data,
│     Node    │ create lead_id
└─────┬───────┘
      │
      ▼
┌─────────────┐
│    HTTP     │ POST to Vapi API
│   Request   │ with assistant config
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Format    │ Prepare response
│  Response   │ JSON
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Respond    │ Send back to
│    To       │ Next.js
│  Webhook    │
└─────────────┘
```

**Workflow 2: Vapi Callback**

```
┌─────────────┐
│   Webhook   │ ← POST from Vapi
│   Trigger   │    (real-time events)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Switch    │ Route by event type
│    Node     │ (call-ended, transcript, etc.)
└─┬───┬───┬───┘
  │   │   │
  ▼   ▼   ▼
┌───────────────────────┐
│  Extract Call Data    │
│  Extract Transcript   │
│  Extract Status       │
└─────┬─────────────────┘
      │
      ▼
┌─────────────┐
│     CRM     │ Store in Airtable,
│  Integration│ Sheets, Salesforce
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Respond    │ ACK to Vapi
│    200      │
└─────────────┘
```

### 3. Voice AI Layer (Vapi)

**Components**:

```
Vapi API
├── Assistant Configuration
│   ├── Model (GPT-4)
│   ├── System Prompt
│   ├── Voice (Eleven Labs)
│   └── First Message
├── Call Orchestration
│   ├── Phone Number Provisioning
│   ├── WebRTC Connection
│   └── Audio Streaming
└── Event System
    ├── call.started
    ├── transcript.update
    ├── call.ended
    └── end-of-call-report
```

**Call Flow**:
```
n8n calls Vapi API
    ↓
Vapi provisions phone number
    ↓
Vapi dials customer
    ↓
Customer answers
    ↓
Vapi streams audio via WebRTC
    ↓
GPT-4 generates responses
    ↓
Eleven Labs synthesizes voice
    ↓
Audio streamed to phone
    ↓
Customer speaks
    ↓
Audio transcribed (Deepgram)
    ↓
GPT-4 processes input
    ↓
[Repeat conversation loop]
    ↓
Call ends (customer or AI)
    ↓
Events sent to n8n webhook
```

## Data Models

### Lead Data (Form Submission)

```typescript
{
  name: string;           // "John Doe"
  email: string;          // "john@example.com"
  phone: string;          // "+15551234567"
  company: string;        // "Acme Inc."
  timestamp: string;      // ISO 8601 datetime
  lead_id?: string;       // Generated by n8n
  status?: string;        // "pending_call"
}
```

### Vapi Call Request

```json
{
  "name": "Lead Qualification Call",
  "assistant": {
    "model": {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.7
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "21m00Tcm4TlvDq8ikWAM"
    },
    "firstMessage": "Hi {{customer.name}}, this is Sarah...",
    "messages": [
      {
        "role": "system",
        "content": "You are a friendly sales assistant..."
      }
    ]
  },
  "customer": {
    "number": "+15551234567",
    "name": "John Doe"
  },
  "metadata": {
    "lead_id": "1234567890",
    "email": "john@example.com",
    "company": "Acme Inc."
  }
}
```

### Vapi Callback Events

**Call Started**:
```json
{
  "message": {
    "type": "call-started"
  },
  "call": {
    "id": "call_abc123",
    "status": "ringing"
  }
}
```

**Transcript Update**:
```json
{
  "message": {
    "type": "transcript",
    "role": "user",
    "transcriptText": "Yes, I'm interested in learning more"
  },
  "call": {
    "id": "call_abc123"
  }
}
```

**End of Call Report**:
```json
{
  "message": {
    "type": "end-of-call-report",
    "summary": "Lead is interested, wants follow-up call",
    "transcript": "Full conversation transcript...",
    "duration": 120
  },
  "call": {
    "id": "call_abc123",
    "status": "ended",
    "startedAt": 1697299200000,
    "endedAt": 1697299320000,
    "recordingUrl": "https://...",
    "metadata": {
      "lead_id": "1234567890"
    }
  }
}
```

## Security Considerations

### API Keys
- Vapi private key only used server-side (n8n)
- Never exposed to browser
- Stored in environment variables

### Webhooks
- n8n webhooks are public but unguessable (UUID in URL)
- Can add authentication via headers
- Vapi supports webhook secrets

### Data Privacy
- Phone numbers validated before submission
- No sensitive data logged in browser
- Call recordings optional
- GDPR-compliant data handling

## Performance Characteristics

### Latency
- **Form Submit → n8n**: ~200ms
- **n8n → Vapi API**: ~500ms
- **Vapi → Phone Ring**: ~30-60s
- **Call Response Time**: ~800ms-1.5s per exchange
- **Total: Form → Call**: < 2 minutes

### Scalability
- **Next.js**: Edge functions, globally distributed
- **n8n**: Queue mode for high volume
- **Vapi**: Auto-scales, handles concurrent calls
- **Bottleneck**: Phone network latency

### Cost
- **Next.js**: Free (Vercel hobby) or $20/mo
- **n8n**: Free (20k executions/mo) or $20/mo
- **Vapi**: ~$0.15-0.30 per minute of call
- **Total per call**: ~$0.20-0.50

## Error Handling

### Frontend
```typescript
try {
  await submitLead(data);
  // Show success
} catch (error) {
  // Show error message
  // Log to monitoring
}
```

### n8n
- Workflow errors logged in execution history
- Can add error trigger workflows
- Retry logic on HTTP failures
- Fallback to email if call fails

### Vapi
- Call failures reported via webhook
- Status: "failed", "no-answer", "busy"
- Can trigger alternative follow-up

## Monitoring & Observability

### Metrics to Track
- Form submission rate
- n8n execution success rate
- Vapi call connection rate
- Average call duration
- Qualification rate
- End-to-end latency

### Logging
- **Next.js**: Server action logs
- **n8n**: Execution history (visual logs)
- **Vapi**: Call logs in dashboard
- **Integration**: Send to Datadog, Sentry, etc.

## Future Enhancements

### Phase 2
- Calendar integration (schedule follow-up)
- Email automation (send transcripts)
- SMS fallback (if no answer)
- A/B testing (different prompts)

### Phase 3
- Multi-language support
- Sentiment analysis
- Lead scoring with ML
- Custom voice cloning
- Video calls

### Phase 4
- Multi-agent conversations
- Dynamic routing (different agents for different leads)
- Real-time coaching (whisper to human on escalation)
- Advanced analytics dashboard

## Deployment Options

### Option 1: Fully Hosted (Recommended for Demo)
- **Next.js**: Vercel
- **n8n**: n8n Cloud
- **Vapi**: Hosted
- **Pros**: Zero devops, fast setup
- **Cons**: Monthly cost, less control

### Option 2: Self-Hosted
- **Next.js**: Any Node.js host
- **n8n**: Docker on VPS
- **Vapi**: Still hosted (no self-host option)
- **Pros**: More control, potentially cheaper
- **Cons**: Requires devops, more setup

### Option 3: Hybrid
- **Next.js**: Vercel
- **n8n**: Self-hosted
- **Vapi**: Hosted
- **Pros**: Balance of convenience and cost
- **Cons**: Some devops required

## Tech Stack Justification

### Why Next.js?
- Modern, fast, developer-friendly
- Built-in API routes (server actions)
- Great TypeScript support
- Easy deployment (Vercel)
- Strong ecosystem

### Why n8n?
- Visual workflow builder (no code required)
- Self-hostable (data privacy)
- Extensive integrations (400+ nodes)
- Active community
- Fair pricing

### Why Vapi?
- Best-in-class voice AI infrastructure
- Simple API (focus on your app, not telephony)
- Natural-sounding voices
- Low latency (<1s response time)
- Built for production scale

## Alternatives Considered

### Instead of Next.js
- **Remix**: Good, but smaller ecosystem
- **SvelteKit**: Great DX, but less enterprise adoption
- **Plain React**: More setup required

### Instead of n8n
- **Zapier**: Great UX, but expensive and not self-hostable
- **Make**: Similar to n8n, but less open
- **Custom Express**: More control, but more code

### Instead of Vapi
- **Twilio + OpenAI**: More complex to set up
- **Bland AI**: Similar, but newer
- **PlayAI**: Good voice, less complete platform

## Questions?

This architecture has been designed for:
- **Simplicity**: Easy to understand and modify
- **Scalability**: Handles growth without rewrite
- **Reliability**: Proven components with fallbacks
- **Cost-effectiveness**: Starts cheap, scales linearly

For more details on any component, see the respective documentation.

