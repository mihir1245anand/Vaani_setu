# Citizen User Journey & Decision Tree

`mermaid
graph TD
    A[Citizen Lands on Portal] --> B{Select Language / Voice}
    B -->|Voice Mode| C[Speak Query in Regional Language]
    B -->|Text Mode| D[Select Demographic Criteria / Form]
    C --> E[Speech-To-Text Transcription]
    D --> F[Eligibility Matching Algorithm]
    E --> F
    F --> G[Categorized Scheme Recommendations]
    G --> H[Interactive Checklist & Required Documents]
    H --> I[Direct Application / CSC Guidance Link]
`
"@
        Msg = "docs: add user journey flowcharts and eligibility decision trees"
        Time = "2026-08-28 21:10:14 +0530"
    },
    @{
        File = "schemas/scheme.schema.json"
        Content = @"
{
  "": "http://json-schema.org/draft-07/schema#",
  "title": "GovernmentScheme",
  "type": "object",
  "required": ["id", "name", "category", "description", "eligibility"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "category": { "type": "string" },
    "description": { "type": "string" },
    "benefits": { "type": "string" },
    "eligibility": {
      "type": "object",
      "properties": {
        "minAge": { "type": "number" },
        "maxAge": { "type": "number" },
        "gender": { "type": "string", "enum": ["all", "male", "female", "transgender"] },
        "maxIncome": { "type": "number" },
        "states": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
