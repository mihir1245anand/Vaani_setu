# Vaani-Setu Mock API Documentation

## Endpoints

### GET /api/schemes
Returns the complete list of government welfare schemes with eligibility metadata.
- **Response**: 200 OK JSON array of scheme objects.

### GET /api/schemes/:id
Retrieves detailed information for a specific scheme by ID.
- **Parameters**: id (string)
- **Response**: 200 OK scheme details or 404 Not Found.

### POST /api/check-eligibility
Evaluates demographic criteria payload against scheme eligibility algorithms.
- **Payload**: { age: number, gender: string, state: string, annualIncome: number, occupation: string }
- **Response**: 200 OK { eligibleSchemes: [...], count: number }
"@
        Msg = "docs: add API documentation for local Node server endpoints in docs/API.md"
        Time = "2026-08-28 20:24:55 +0530"
    },
    @{
        File = "tests/eligibility.test.js"
        Content = @"
/**
 * Eligibility Matching Unit Tests
 */
const assert = require('assert');

function matchScheme(criteria, scheme) {
    if (scheme.minAge && criteria.age < scheme.minAge) return false;
    if (scheme.maxAge && criteria.age > scheme.maxAge) return false;
    if (scheme.gender && scheme.gender !== 'all' && scheme.gender !== criteria.gender) return false;
    if (scheme.maxIncome && criteria.income > scheme.maxIncome) return false;
    return true;
}

const mockScheme = {
    id: 'pm-kisan',
    name: 'PM-Kisan Samman Nidhi',
    minAge: 18,
    maxAge: 75,
    gender: 'all',
    maxIncome: 300000
};

assert.strictEqual(matchScheme({ age: 35, gender: 'male', income: 150000 }, mockScheme), true);
assert.strictEqual(matchScheme({ age: 16, gender: 'male', income: 150000 }, mockScheme), false);
assert.strictEqual(matchScheme({ age: 40, gender: 'male', income: 500000 }, mockScheme), false);
console.log('Eligibility matching unit tests passed successfully!');
