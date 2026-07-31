import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Frontend'i sun
app.use(express.static(path.join(process.cwd(), 'dist')));

// Target the customCards.json file in the main game's src/data directory
// Since we are inside `oyun yeni/oyun-admin-panel`, the target is `../src/data/customCards.json`
const DATA_FILE = path.join(process.cwd(), '..', 'src', 'data', 'customCards.json');

app.get('/api/cards', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ tasks: [], games: [], questions: [] });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Failed to read data file' });
    }
  }
});

app.post('/api/cards', async (req, res) => {
  try {
    const newData = req.body;
    await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to write data file' });
  }
});

app.listen(port, () => {
  console.log(`Admin Panel API Server running at http://localhost:${port}`);
});
