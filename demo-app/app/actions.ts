"use server";

import { leadFormSchema, LeadFormData } from "@/lib/schemas";

export async function submitLead(data: LeadFormData) {
    // Validate the data
    const validated = leadFormSchema.parse(data);

    // Get the n8n webhook URL from environment variables
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        throw new Error("N8N_WEBHOOK_URL is not configured");
    }

    try {
        // Send data to n8n webhook
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: validated.name,
                email: validated.email,
                phone: validated.phone,
                company: validated.company,
                timestamp: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("n8n webhook error:", response.status, errorText);
            throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
        }

        // Try to parse JSON, but handle empty responses
        const text = await response.text();
        let result;

        try {
            result = text ? JSON.parse(text) : { received: true };
        } catch (parseError) {
            console.warn("Response is not JSON:", text);
            result = { received: true, raw: text };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Error submitting lead:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

