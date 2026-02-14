import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { AgentCore } from '../engine/agent-core';
import { OperationalMode } from '../engine/mode-manager';

const app = express();
// Global Error Handlers (Catch silent crashes)
process.on('uncaughtException', (err) => {
  try {
    console.error('CRITICAL: Uncaught Exception:', err);
    if (Logger) Logger.error('CRITICAL: Uncaught Exception:', err);
  } catch (e) {
    // If logging fails, try purely stderr and give up
    process.stderr.write(`CRITICAL FAILURE IN ERROR HANDLER: ${e}\nOriginal Error: ${err}\n`);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    console.error('CRITICAL: Unhandled Rejection:', reason);
    if (Logger) Logger.error('CRITICAL: Unhandled Rejection:', reason);
  } catch (e) {
    process.stderr.write(`CRITICAL FAILURE IN REJECTION HANDLER: ${e}\nOriginal Reason: ${reason}\n`);
  }
});

const port = 3000;
const CONFIG_DIR = path.join(__dirname, '../../config');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// File Upload Setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes

// API: Status check
app.get('/api/status', (req, res) => {
  res.json({ status: 'Agent is ready', mode: 'IDLE' });
});

// API: List Configs
app.get('/api/configs', (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(CONFIG_DIR).filter((f) => f.endsWith('.json'));
    const configs = files.map((file) => {
      try {
        const content = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf-8');
        const json = JSON.parse(content);
        // Use bankName if available, else fallback to filename
        return {
          filename: file,
          name: json.bankName || file,
        };
      } catch (e) {
        // If file is unreadable or invalid JSON, return filename as name
        return { filename: file, name: file };
      }
    });

    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// API: Get Config
app.get('/api/configs/:filename', (req, res) => {
  try {
    const filepath = path.join(CONFIG_DIR, req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Config file not found' });
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// API: Save Config
app.post('/api/configs/:filename', (req, res) => {
  try {
    const filepath = path.join(CONFIG_DIR, req.params.filename);
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(filepath, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Config saved' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// SSE Clients
let sseClients: any[] = [];

// API: SSE Progress Endpoint
app.get('/api/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };

  sseClients.push(newClient);
  console.log(`SSE Client connected: ${clientId}`);

  req.on('close', () => {
    console.log(`SSE Client disconnected: ${clientId}`);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

function broadcastProgress(message: string) {
  sseClients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify({ message })}\n\n`);
  });
}

// API: Analyze PDF
app.post('/api/analyze', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const tempFilePath = path.join(__dirname, `temp_${Date.now()}_${req.file.originalname}`);

  try {
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, req.file.buffer);
    console.log(`Processing file: ${tempFilePath}`);
    broadcastProgress(`Starting analysis of ${req.file.originalname}...`);

    // Initialize Agent
    // Extract configName from request body (Multer parses body fields too)
    const configName = req.body.configName;

    if (!configName) {
      throw new Error('No configuration profile selected. Please select a bank profile.');
    }

    // Load Config
    const configPath = path.join(CONFIG_DIR, configName);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file '${configName}' not found.`);
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    const t2Config = JSON.parse(configContent);

    const agent = new AgentCore({
      mode: OperationalMode.MAD_DOG,
      ollamaModel: 'llama3', // Make configurable?
      t2Config: t2Config,
    });

    // Run Agent with Progress Callback
    const result = await agent.run(tempFilePath, (msg) => {
      broadcastProgress(msg);
    });

    // Cleanup
    fs.unlinkSync(tempFilePath);

    res.json({
      success: true,
      message: `Successfully analyzed ${req.file.originalname}`,
      data: result, // Returns the full T2ImpactAnalysisResult
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    broadcastProgress(`ERROR: ${(error as Error).message}`);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

import { Logger } from '../infrastructure/logger';

// ... imports ...

// Start Server
app.listen(port, () => {
  Logger.info(`Server is running at http://localhost:${port}`);
  Logger.info(`Serving static files from: ${path.join(__dirname, '../../public')}`);
});
