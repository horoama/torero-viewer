const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename, handle duplicates if necessary, but for now simple overwrite/timestamp is fine
    // Using Date.now() to prevent overwriting same name files or just simple name
    // The requirement says "previously uploaded json list", so keeping original name is good for identification
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// API: Upload JSON
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// API: List Files
app.get('/api/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory');
    }
    // Filter for json files only if needed, but assuming user uploads json
    const jsonFiles = files.filter(file => file.endsWith('.json') || file.endsWith('.txt')); // Trello export might be .json or .txt

    // It might be useful to return more info like date, but filename includes timestamp
    const fileList = jsonFiles.map(file => {
      return {
        filename: file,
        uploadedAt: parseInt(file.split('-')[0]) // Extract timestamp assuming format timestamp-name
      };
    }).sort((a, b) => b.uploadedAt - a.uploadedAt); // Newest first

    res.json(fileList);
  });
});

// API: Get File Content
app.get('/api/files/:filename', (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('File not found');
  }

  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      res.status(500).send('Error parsing JSON');
    }
  });
});

// API: Get OGP Image and Metadata
app.get('/api/ogp', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000,
      responseType: 'arraybuffer'
    });

    let data = response.data;
    const contentType = response.headers['content-type'];

    // Simple charset detection from Content-Type
    let charset = 'utf-8';
    if (contentType) {
        const match = contentType.match(/charset=([^;]+)/i);
        if (match) {
            charset = match[1].trim();
        }
    }

    // Decode if necessary
    if (charset && !charset.toLowerCase().includes('utf-8')) {
        try {
            data = iconv.decode(data, charset);
        } catch (e) {
            data = data.toString();
        }
    } else {
        data = data.toString();
    }

    const $ = cheerio.load(data);

    // Extract Image
    let ogImage = $('meta[property="og:image"]').attr('content');
    if (!ogImage) {
      ogImage = $('meta[name="og:image"]').attr('content');
    }
    if (!ogImage) {
      ogImage = $('meta[name="twitter:image"]').attr('content');
    }
    if (!ogImage) {
        ogImage = $('link[rel="image_src"]').attr('href');
    }

    // Extract Title
    let title = $('meta[property="og:title"]').attr('content');
    if (!title) {
        title = $('title').text();
    }

    // Extract Description
    let description = $('meta[property="og:description"]').attr('content');
    if (!description) {
        description = $('meta[name="description"]').attr('content');
    }

    // Extract Favicon
    let favicon = $('link[rel="icon"]').attr('href');
    if (!favicon) {
        favicon = $('link[rel="shortcut icon"]').attr('href');
    }

    // Helper to resolve relative URLs
    const resolveUrl = (url) => {
        if (url && !url.startsWith('http')) {
            try {
                return new URL(url, targetUrl).href;
            } catch (e) {
                return null;
            }
        }
        return url;
    };

    ogImage = resolveUrl(ogImage);
    favicon = resolveUrl(favicon);

    res.json({
        imageUrl: ogImage || null,
        title: title || null,
        description: description || null,
        favicon: favicon || null
    });

  } catch (error) {
    console.error('Error fetching OGP:', error.message);
    res.json({ imageUrl: null, error: 'Failed to fetch OGP' });
  }
});

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('{/*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
