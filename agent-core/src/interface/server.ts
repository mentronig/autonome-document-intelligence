import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// File Upload Setup
const storage = multer.memoryStorage(); // Store in memory for now, pass buffer to AgentCore
const upload = multer({ storage: storage });

// Routes

// API: Status check
app.get('/api/status', (req, res) => {
  res.json({ status: 'Agent is ready', mode: 'IDLE' });
});

// API: Analyze PDF
app.post('/api/analyze', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  console.log(`Received file: ${req.file.originalname}`);

  // TODO: Connect to AgentCore here
  // const agent = new AgentCore();
  // const result = await agent.process(req.file.buffer);

  // Mock response for now
  setTimeout(() => {
    res.json({
      success: true,
      message: `Successfully analyzed ${req.file?.originalname}`,
      report: '# Mock Report\n\nThis is a placeholder for the agent output.',
    });
  }, 2000);
});

// API: List Results (Mock)
app.get('/api/results', (req, res) => {
  res.json([{ id: 1, filename: 'doc1.pdf', date: new Date().toISOString(), status: 'COMPLETED' }]);
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../../public')}`);
});
