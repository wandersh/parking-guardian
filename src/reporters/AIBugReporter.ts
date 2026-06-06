export interface FailureContext {
  testName: string;
  endpoint: string;
  expected: string;
  actual: string;
  statusCode: number;
}

export async function generateBugReport(failure: FailureContext): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are a senior SDET at Flash, a parking + EV charging platform. Generate concise, structured bug reports in valid JSON format only.',
        messages: [
          {
            role: 'user',
            content: `Generate a structured bug report for the following test failure:
- Test Name: "${failure.testName}"
- Failed Endpoint: "${failure.endpoint}"
- Expected behavior: "${failure.expected}"
- Actual behavior: "${failure.actual}"
- Status Code: ${failure.statusCode}

Respond ONLY with a JSON object. No other text or markdown wrappers. The JSON object must match this schema:
{
  "title": "string",
  "severity": "string (CRITICAL/HIGH/MEDIUM/LOW)",
  "rootCauseProbable": "string",
  "businessImpact": "string",
  "stepsToReproduce": ["string", "string", ...],
  "suggestedFix": "string"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();
    const text = data.content?.[0]?.text || '';
    
    // Extract JSON block in case model wrapped it in markdown codeblocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr);

    return `
⚡ [Flash AI Bug Reporter] - Bug Report Generated:
==================================================
Title: ${parsed.title}
Severity: ${parsed.severity}
Probable Root Cause: ${parsed.rootCauseProbable}
Business Impact: ${parsed.businessImpact}
Steps to Reproduce:
${(parsed.stepsToReproduce || []).map((step: string, i: number) => `  ${i + 1}. ${step}`).join('\n')}
Suggested Fix: ${parsed.suggestedFix}
==================================================`;
  } catch (error: any) {
    // Return fallback bug report
    return `
⚡ [Flash AI Bug Reporter] - Bug Report (Fallback due to ${error.message || 'API error'}):
==================================================
Title: Bug: Test "${failure.testName}" failed at endpoint "${failure.endpoint}"
Severity: HIGH
Probable Root Cause: Mismatch in API response. Expected status or body mismatch.
Business Impact: Disruptions in ${failure.endpoint} service.
Steps to Reproduce:
  1. Trigger API request to "${failure.endpoint}"
  2. Expected outcome: "${failure.expected}"
  3. Actual outcome: "${failure.actual}" (Status Code: ${failure.statusCode})
Suggested Fix: Review server-side handler for "${failure.endpoint}" to handle invalid inputs or race conditions.
==================================================`;
  }
}
