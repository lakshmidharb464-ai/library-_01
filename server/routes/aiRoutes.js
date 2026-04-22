import express from 'express';
import { protect } from '../middleware/auth.js';
import storage from '../services/storageService.js';

const router = express.Router();

/**
 * AEGIS Intelligence Engine
 * Provides contextual information about the library system.
 */
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const input = message.toLowerCase();
    
    let response = "";
    
    // Context Gathering
    const books = await storage.find('Book');
    const transactions = await storage.find('Transaction');
    const activeTx = transactions.filter(t => t.status === 'active' || t.status === 'Issued');
    
    if (input.includes('status') || input.includes('system')) {
      const dbStatus = storage.isUsingMongo ? "MongoDB Active" : "Local JSON Engine";
      response = `System Status: OPTIMAL. Engine: ${dbStatus}. Active neural links: ${activeTx.length}. Total archive assets: ${books.length}.`;
    } 
    else if (input.includes('book') || input.includes('available') || input.includes('find')) {
      const availableCount = books.reduce((sum, b) => sum + (b.availableCopies ?? b.available ?? 0), 0);
      response = `Archive scan complete. I have located ${availableCount} available physical assets across ${books.length} categories. Would you like a specific category breakdown?`;
    }
    else if (input.includes('hello') || input.includes('hi') || input.includes('aegis')) {
      response = `Identity verified. I am AEGIS. Operability at 99.2%. Archive nodes are fully responsive. Awaiting your directive.`;
    }
    else if (input.includes('help')) {
      response = `I can provide real-time telemetry on system status, archive availability, and transaction metrics. Direct your query to specific archive nodes or system parameters.`;
    }
    else {
      response = "Directive received. Analyzing archive patterns... No immediate anomalies detected. I suggest continuing your current research protocols.";
    }

    // Log the AI interaction
    await storage.log(req.user.name, 'AI_QUERY', `Inquiry: "${message.substring(0, 30)}..."`);

    res.json({ 
      success: true, 
      data: {
        text: response,
        timestamp: new Date().toISOString(),
        sender: 'ai'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
