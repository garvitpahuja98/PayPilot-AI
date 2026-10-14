/**
 * @file aiClient.js
 * @description AI integration service for invoice drafting and payment reminder generation.
 * Supports Google Gemini API (or OpenAI) with a clean built-in mock fallback for offline development.
 */

import { config } from '../../config/environment.js';

/**
 * Generates itemized invoice line items from a plain-text project description.
 */
export async function generateInvoiceDraft({ projectSummary, targetHourlyRate = 85.0, currency = 'USD' }) {
  if (!config.ai.isConfigured || config.ai.provider === 'mock') {
    return generateMockInvoiceDraft(projectSummary, targetHourlyRate, currency);
  }

  try {
    // Example Gemini REST completion API integration:
    const prompt = `You are an expert freelance billing assistant. Convert the following project summary into a structured JSON invoice draft.
Return strictly a JSON object with:
{
  "suggestedTitle": string,
  "items": [{ "description": string, "quantity": number, "unitPrice": number, "amount": number }],
  "suggestedNotes": string
}
Hourly rate: ${targetHourlyRate} ${currency}.
Summary: "${projectSummary}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.modelName}:generateContent?key=${config.ai.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      console.warn(`[AI Service] API request failed (${response.status}), falling back to deterministic template.`);
      return generateMockInvoiceDraft(projectSummary, targetHourlyRate, currency);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return {
      ...parsed,
      model: config.ai.modelName,
      isMock: false
    };
  } catch (error) {
    console.warn('[AI Service] Exception invoking AI provider:', error.message);
    return generateMockInvoiceDraft(projectSummary, targetHourlyRate, currency);
  }
}

/**
 * Generates a contextual payment reminder draft.
 */
export async function generatePaymentReminder({
  invoiceNumber,
  clientName = 'Valued Client',
  amount = 0.0,
  dueDate = 'recently',
  daysPastDue = 0,
  tone = 'polite'
}) {
  if (!config.ai.isConfigured || config.ai.provider === 'mock') {
    return generateMockPaymentReminder({ invoiceNumber, clientName, amount, dueDate, daysPastDue, tone });
  }

  try {
    const prompt = `Write an email reminder for an invoice. Tone: ${tone}.
Invoice Number: ${invoiceNumber}
Client: ${clientName}
Amount: $${amount}
Due Date: ${dueDate}
Days overdue: ${daysPastDue}
Return JSON: { "subject": string, "message": string }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.modelName}:generateContent?key=${config.ai.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      return generateMockPaymentReminder({ invoiceNumber, clientName, amount, dueDate, daysPastDue, tone });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return {
      ...parsed,
      tone,
      model: config.ai.modelName,
      isMock: false
    };
  } catch (error) {
    return generateMockPaymentReminder({ invoiceNumber, clientName, amount, dueDate, daysPastDue, tone });
  }
}

// Deterministic mock generation for local development without API keys
function generateMockInvoiceDraft(summary, rate = 85.0, currency = 'USD') {
  const cleanRate = parseFloat(rate) || 85.0;
  return {
    suggestedTitle: `Project Services: ${summary.slice(0, 40)}...`,
    items: [
      {
        description: `Architecture & Core Implementation: ${summary}`,
        quantity: 12.0,
        unitPrice: cleanRate,
        amount: parseFloat((12.0 * cleanRate).toFixed(2))
      },
      {
        description: 'Code Review, Quality Testing & Deployment Verification',
        quantity: 4.0,
        unitPrice: cleanRate,
        amount: parseFloat((4.0 * cleanRate).toFixed(2))
      }
    ],
    suggestedNotes: `Payment due within 14 days of issue. Invoiced in ${currency}. Thank you for your business!`,
    model: 'mock-offline-ai-engine',
    isMock: true
  };
}

function generateMockPaymentReminder({ invoiceNumber, clientName, amount, dueDate, daysPastDue, tone }) {
  const formattedAmount = `$${parseFloat(amount || 0).toFixed(2)}`;
  
  if (tone === 'firm') {
    return {
      subject: `Urgent: Outstanding Balance for Invoice ${invoiceNumber}`,
      message: `Dear ${clientName},\n\nOur records indicate that Invoice ${invoiceNumber} for the balance of ${formattedAmount} is now ${daysPastDue} days overdue (due date: ${dueDate}).\n\nPlease submit payment today to prevent disruption to your services.\n\nThank you,\nPayPilot AI Billing`,
      tone: 'firm',
      model: 'mock-offline-ai-engine',
      isMock: true
    };
  }

  return {
    subject: `Gentle Reminder: Invoice ${invoiceNumber} Payment Due`,
    message: `Hi ${clientName},\n\nI hope you're having a great week! This is a friendly reminder that Invoice ${invoiceNumber} for ${formattedAmount} was due on ${dueDate}.\n\nPlease let me know if you have any questions or need a copy of the original invoice.\n\nBest regards,\nAlex Morgan`,
    tone: 'polite',
    model: 'mock-offline-ai-engine',
    isMock: true
  };
}
