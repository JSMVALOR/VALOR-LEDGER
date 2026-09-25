const fs = require('fs');

let content = fs.readFileSync('src/lib/data.ts', 'utf8');

// We need to parse initialLeads out, filter them, and re-inject.
// Since data.ts is just TS, we can require it after compiling, but it's simpler to do string manipulation or just write a fresh data.ts using the existing data.
