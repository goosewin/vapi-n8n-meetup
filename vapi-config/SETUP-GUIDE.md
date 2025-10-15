# Vapi Assistant Setup Guide

## Option 1: Create Assistant via Dashboard (Recommended for Demo)

1. **Log into Vapi Dashboard**
   - Go to https://dashboard.vapi.ai
   - Navigate to "Assistants"

2. **Create New Assistant**
   - Click "New Assistant"
   - Name: "Lead Qualification Assistant"

3. **Configure Model**
   - Provider: OpenAI
   - Model: gpt-4
   - Temperature: 0.7

4. **Set System Prompt**
   ```
   You are a friendly sales assistant calling leads who just requested a demo. Your goal is to:

   1. Greet them warmly and confirm they requested the demo
   2. Ask about their company size (small startup, mid-size, enterprise)
   3. Understand their biggest challenge or problem they're trying to solve
   4. Gauge their timeline for implementing a solution (urgent, next quarter, exploring)
   5. Ask if they'd like to schedule a 15-minute sales call with a specialist

   IMPORTANT GUIDELINES:
   - Be conversational and natural, not robotic
   - Keep the call brief (2-3 minutes max)
   - If they're busy, offer to call back later
   - Listen actively and ask follow-up questions
   - Don't be pushy about the sales call
   - End politely and thank them for their time
   ```

5. **Configure Voice**
   - Provider: 11Labs
   - Voice: Choose "Rachel" or "Sarah" (professional female voice)
   - Or Voice ID: `21m00Tcm4TlvDq8ikWAM`

6. **Set First Message**
   ```
   Hi {{customer.name}}, this is Sarah calling from Vapi AI. You just requested a demo through our website. Do you have a quick minute to chat about your needs?
   ```

7. **Enable Recording**
   - Toggle "Recording" to ON

8. **Configure Server URL (for callbacks)**
   - Server URL: `https://dan-vapi.app.n8n.cloud/webhook/vapi-callback`
   - This sends call events back to n8n

9. **Save Assistant**
   - Copy the Assistant ID (you'll need this)

## Option 2: Use Inline Assistant in n8n Workflow

The n8n workflow is already configured to use an inline assistant definition, so you can use it without creating a dashboard assistant. Just ensure the workflow has the correct configuration.

## Testing the Assistant

1. **Test via Dashboard**
   - In Vapi dashboard, use the "Test" button
   - Enter your phone number
   - You should receive a call within seconds

2. **Test via n8n Workflow**
   - Submit the form on the Next.js app
   - Check n8n execution logs
   - Verify the call is initiated

## Voice Options

### Recommended Voices (11Labs):
- **Rachel** (21m00Tcm4TlvDq8ikWAM) - Professional, warm
- **Bella** (EXAVITQu4vr4xnSDxMaL) - Friendly, energetic
- **Antoni** (ErXwobaYiN019PkySvjV) - Professional male

### Alternative Providers:
- **Deepgram**: Lower latency, good for real-time
- **PlayHT**: Wide voice selection
- **Azure**: Enterprise-grade

## Advanced Configuration

### Structured Data Collection

Add function calling to extract structured data:

```json
{
  "functions": [
    {
      "name": "record_qualification",
      "description": "Record lead qualification data",
      "parameters": {
        "type": "object",
        "properties": {
          "company_size": {
            "type": "string",
            "enum": ["startup", "mid-size", "enterprise"]
          },
          "main_challenge": {
            "type": "string"
          },
          "timeline": {
            "type": "string",
            "enum": ["urgent", "next_quarter", "exploring"]
          },
          "wants_sales_call": {
            "type": "boolean"
          }
        },
        "required": ["company_size", "timeline"]
      }
    }
  ]
}
```

### Custom End Phrases

Customize when the call should end:

```json
{
  "endCallPhrases": [
    "goodbye",
    "thank you bye",
    "have a great day",
    "talk to you soon"
  ]
}
```

## Troubleshooting

### Call Not Connecting
- Verify phone number format: +1234567890
- Check Vapi account balance
- Ensure phone number supports inbound calls

### Poor Call Quality
- Use lower temperature (0.5-0.6) for more consistent responses
- Switch to faster model (gpt-3.5-turbo) for lower latency
- Use Deepgram for voice provider

### Webhook Not Receiving Data
- Verify n8n webhook URL is correct
- Check n8n workflow is activated
- Test webhook with Vapi dashboard "Test Webhook" feature

