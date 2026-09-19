
// server.js
import express from 'express';

const app = express();

// Detect Googlebot
function isGooglebot(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  return ua.includes('googlebot');
}

// --- Example data source (replace with your real API calls) ---
function getBubbleLineData() {
  return {
    title: "Bubble Line Analysis",
    description: "Visual bubble line analysis for market trends.",
    content: "<h1>Bubble Line</h1><p>Market bubble line analysis...</p>"
  };
}

function getDropRecoveryData() {
  return {
    title: "Drop Recovery",
    description: "Analyze stock drop recovery patterns.",
    content: "<h1>Drop Recovery</h1><p>Recovery pattern analysis...</p>"
  };
}

function getHoldingsData() {
  return {
    title: "Holdings Overview",
    description: "Your holdings breakdown and performance.",
    content: "<h1>Holdings</h1><p>Holdings performance overview...</p>"
  };
}

// --- HTML template ---
function buildHTML({ title, description, content }) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}">
        <link rel="canonical" href="https://sharecompare.org">
      </head>
      <body>
        <div id="root">${content}</div>

        <!-- Your React SPA bundle -->
        <script src="/static/js/bundle.js"></script>
      </body>
    </html>
  `;
}


// --- ROUTE 1: /bubbleLine ---
app.get('/bubbleLine', (req, res) => {
  const data = getBubbleLineData();

  if (isGooglebot(req)) {
    return res.send(buildHTML(data));
  }

  // Normal users → JSON or SPA hydration
  return res.json(data);
});

// --- ROUTE 2: /dropRecovery ---
app.get('/dropRecovery', (req, res) => {
  const data = getDropRecoveryData();

  if (isGooglebot(req)) {
    return res.send(buildHTML(data));
  }

  return res.json(data);
});

// --- ROUTE 3: /holdings ---
app.get('/holdings', (req, res) => {
  const data = getHoldingsData();

  if (isGooglebot(req)) {
    return res.send(buildHTML(data));
  }

  return res.json(data);
});

// --- Start server ---
app.listen(3000, () => {
  console.log('SSR server running on port 3000');
});