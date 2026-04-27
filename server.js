const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'shadow-secret-key-749926';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// File paths
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const THEMES_FILE = path.join(DATA_DIR, 'themes.json');

// Initialize default data
function initData() {
  // Default settings
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      siteName: "Shadow Official",
      adminPassword: bcrypt.hashSync('r749926n', 10),
      currentTheme: "cyberpunk",
      about: {
        name: "Shadow Developer",
        title: "Full Stack Web Developer",
        description: "Passionate web developer specializing in modern, responsive websites and web applications. I create stunning digital experiences with cutting-edge technologies.",
        email: "shadow@example.com",
        location: "Pakistan",
        avatar: ""
      },
      social: {
        whatsapp: "+92-XXX-XXXXXXX",
        telegram: "@shadowofficial",
        whatsappChannel: "https://whatsapp.com/channel/shadow",
        telegramChannel: "https://t.me/shadowchannel",
        youtube: "https://youtube.com/@shadowofficial"
      },
      contact: {
        phone: "+92-XXX-XXXXXXX"
      }
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }

  // Default themes
  if (!fs.existsSync(THEMES_FILE)) {
    const defaultThemes = [
      { id: "cyberpunk", name: "Cyberpunk Neon", colors: { primary: "#00f0ff", secondary: "#ff00a0", bg: "#0a0a0f", card: "#12121a" } },
      { id: "dark-elegant", name: "Dark Elegant", colors: { primary: "#c9a96e", secondary: "#8b7355", bg: "#0f0f0f", card: "#1a1a1a" } },
      { id: "ocean-blue", name: "Ocean Blue", colors: { primary: "#00d4ff", secondary: "#0099cc", bg: "#001a33", card: "#002a4d" } },
      { id: "purple-dream", name: "Purple Dream", colors: { primary: "#b347d9", secondary: "#7c3aed", bg: "#1a0b2e", card: "#240e45" } },
      { id: "emerald-green", name: "Emerald Green", colors: { primary: "#00ff88", secondary: "#00cc6a", bg: "#001a0f", card: "#002914" } },
      { id: "sunset-orange", name: "Sunset Orange", colors: { primary: "#ff6b35", secondary: "#f7931e", bg: "#1a0a00", card: "#2a1405" } },
      { id: "cherry-red", name: "Cherry Red", colors: { primary: "#ff0040", secondary: "#cc0033", bg: "#1a0008", card: "#2a0010" } },
      { id: "golden-luxury", name: "Golden Luxury", colors: { primary: "#ffd700", secondary: "#c5a000", bg: "#0f0a00", card: "#1a1400" } },
      { id: "midnight-blue", name: "Midnight Blue", colors: { primary: "#4fc3f7", secondary: "#29b6f6", bg: "#051e3e", card: "#0a2a52" } },
      { id: "matrix-green", name: "Matrix Green", colors: { primary: "#39ff14", secondary: "#00cc00", bg: "#001100", card: "#002200" } },
      { id: "pink-rose", name: "Pink Rose", colors: { primary: "#ff69b4", secondary: "#ff1493", bg: "#1a0010", card: "#2a0018" } },
      { id: "ice-white", name: "Ice White", colors: { primary: "#e0e0e0", secondary: "#b0b0b0", bg: "#0a0a0a", card: "#151515" } },
      { id: "fire-red", name: "Fire Red", colors: { primary: "#ff4500", secondary: "#cc3700", bg: "#1a0500", card: "#2a0a00" } },
      { id: "neon-yellow", name: "Neon Yellow", colors: { primary: "#ffff00", secondary: "#cccc00", bg: "#141400", card: "#1f1f00" } },
      { id: "aqua-teal", name: "Aqua Teal", colors: { primary: "#00ffff", secondary: "#00cccc", bg: "#001a1a", card: "#002929" } },
      { id: "lavender", name: "Lavender", colors: { primary: "#e6e6fa", secondary: "#b8b8d1", bg: "#0d0d14", card: "#141420" } },
      { id: "coral", name: "Coral", colors: { primary: "#ff7f50", secondary: "#e86c3a", bg: "#1a0802", card: "#2a1005" } },
      { id: "mint", name: "Mint Fresh", colors: { primary: "#98ff98", secondary: "#7de87d", bg: "#051405", card: "#0a1f0a" } },
      { id: "silver-tech", name: "Silver Tech", colors: { primary: "#c0c0c0", secondary: "#a0a0a0", bg: "#080808", card: "#121212" } },
      { id: "ruby", name: "Ruby", colors: { primary: "#e0115f", secondary: "#b30d4b", bg: "#140008", card: "#1f000d" } },
      { id: "sapphire", name: "Sapphire", colors: { primary: "#0f52ba", secondary: "#0a3d8f", bg: "#000814", card: "#001029" } },
      { id: "amethyst", name: "Amethyst", colors: { primary: "#9966cc", secondary: "#7a4fb5", bg: "#110b1c", card: "#1a1130" } },
      { id: "turquoise", name: "Turquoise", colors: { primary: "#40e0d0", secondary: "#30b8aa", bg: "#001414", card: "#002020" } },
      { id: "crimson", name: "Crimson", colors: { primary: "#dc143c", secondary: "#b01030", bg: "#140005", card: "#1f0008" } },
      { id: "neon-orange", name: "Neon Orange", colors: { primary: "#ff6600", secondary: "#cc5200", bg: "#1a0800", card: "#291000" } },
      { id: "platinum", name: "Platinum", colors: { primary: "#e5e4e2", secondary: "#c0bfbd", bg: "#0a0a0a", card: "#141414" } },
      { id: "jade", name: "Jade", colors: { primary: "#00a86b", secondary: "#008655", bg: "#00140d", card: "#00291a" } },
      { id: "amber", name: "Amber", colors: { primary: "#ffbf00", secondary: "#cc9900", bg: "#1a1200", card: "#2a1f00" } },
      { id: "electric-violet", name: "Electric Violet", colors: { primary: "#8f00ff", secondary: "#7200cc", bg: "#0f001a", card: "#1a002e" } },
      { id: "rainbow", name: "Rainbow", colors: { primary: "#ff0000", secondary: "#00ff00", bg: "#0a0a0a", card: "#151515" } },
      { id: "ghost-white", name: "Ghost White", colors: { primary: "#f8f8ff", secondary: "#d0d0e0", bg: "#0a0a0e", card: "#121218" } }
    ];
    fs.writeFileSync(THEMES_FILE, JSON.stringify(defaultThemes, null, 2));
  }

  // Default projects - 30 viral projects
  if (!fs.existsSync(PROJECTS_FILE)) {
    const defaultProjects = [
      { id: uuidv4(), title: "AI Chat Bot Website", link: "https://example.com/ai-chat", banner: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800", category: "AI" },
      { id: uuidv4(), title: "E-Commerce Store", link: "https://example.com/store", banner: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800", category: "Business" },
      { id: uuidv4(), title: "Social Media Dashboard", link: "https://example.com/dashboard", banner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", category: "Dashboard" },
      { id: uuidv4(), title: "Portfolio Generator", link: "https://example.com/portfolio", banner: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", category: "Tool" },
      { id: uuidv4(), title: "Weather App", link: "https://example.com/weather", banner: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800", category: "App" },
      { id: uuidv4(), title: "Crypto Tracker", link: "https://example.com/crypto", banner: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800", category: "Finance" },
      { id: uuidv4(), title: "Task Manager", link: "https://example.com/tasks", banner: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800", category: "Productivity" },
      { id: uuidv4(), title: "Music Player", link: "https://example.com/music", banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", category: "Entertainment" },
      { id: uuidv4(), title: "Video Streaming Platform", link: "https://example.com/stream", banner: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800", category: "Entertainment" },
      { id: uuidv4(), title: "Blog Website", link: "https://example.com/blog", banner: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800", category: "Content" },
      { id: uuidv4(), title: "Food Delivery App", link: "https://example.com/food", banner: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", category: "Business" },
      { id: uuidv4(), title: "Fitness Tracker", link: "https://example.com/fitness", banner: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800", category: "Health" },
      { id: uuidv4(), title: "Online Learning Platform", link: "https://example.com/learn", banner: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800", category: "Education" },
      { id: uuidv4(), title: "Job Portal", link: "https://example.com/jobs", banner: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800", category: "Business" },
      { id: uuidv4(), title: "Real Estate Website", link: "https://example.com/realestate", banner: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800", category: "Business" },
      { id: uuidv4(), title: "Travel Booking Site", link: "https://example.com/travel", banner: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800", category: "Travel" },
      { id: uuidv4(), title: "News Aggregator", link: "https://example.com/news", banner: "https://images.unsplash.com/photo-1504711434969-e33886168db5?w=800", category: "Content" },
      { id: uuidv4(), title: "URL Shortener", link: "https://example.com/short", banner: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", category: "Tool" },
      { id: uuidv4(), title: "QR Code Generator", link: "https://example.com/qr", banner: "https://images.unsplash.com/photo-1586449480537-3a22a98cd86e?w=800", category: "Tool" },
      { id: uuidv4(), title: "Password Manager", link: "https://example.com/password", banner: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800", category: "Security" },
      { id: uuidv4(), title: "File Sharing Platform", link: "https://example.com/share", banner: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800", category: "Tool" },
      { id: uuidv4(), title: "Video Conferencing", link: "https://example.com/meet", banner: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800", category: "Communication" },
      { id: uuidv4(), title: "Code Editor Online", link: "https://example.com/editor", banner: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800", category: "Developer" },
      { id: uuidv4(), title: "Image Gallery", link: "https://example.com/gallery", banner: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", category: "Media" },
      { id: uuidv4(), title: "Event Booking System", link: "https://example.com/events", banner: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", category: "Business" },
      { id: uuidv4(), title: "Chat Application", link: "https://example.com/chat", banner: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800", category: "Communication" },
      { id: uuidv4(), title: "Finance Dashboard", link: "https://example.com/finance", banner: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", category: "Finance" },
      { id: uuidv4(), title: "SaaS Landing Page", link: "https://example.com/saas", banner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", category: "Business" },
      { id: uuidv4(), title: "NFT Marketplace", link: "https://example.com/nft", banner: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800", category: "Crypto" },
      { id: uuidv4(), title: "AI Image Generator", link: "https://example.com/ai-image", banner: "https://images.unsplash.com/photo-1675271591211-7ad8e8f8f9f6?w=800", category: "AI" }
    ];
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2));
  }
}

initData();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper functions
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ==================== PUBLIC ROUTES ====================

// Get all projects
app.get('/api/projects', (req, res) => {
  const projects = readJSON(PROJECTS_FILE);
  res.json(projects);
});

// Get site settings (public-safe)
app.get('/api/settings', (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  const publicSettings = {
    siteName: settings.siteName || "Shadow Official",
    currentTheme: settings.currentTheme || "cyberpunk",
    about: settings.about || {},
    social: settings.social || {},
    contact: settings.contact || {}
  };
  res.json(publicSettings);
});

// Get all themes
app.get('/api/themes', (req, res) => {
  const themes = readJSON(THEMES_FILE);
  res.json(themes);
});

// ==================== ADMIN ROUTES ====================

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  
  const settings = readJSON(SETTINGS_FILE);
  const isValid = bcrypt.compareSync(password, settings.adminPassword);
  
  if (!isValid) return res.status(401).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, success: true });
});

// Add project
app.post('/api/admin/projects', authMiddleware, upload.single('banner'), (req, res) => {
  const { title, link, category } = req.body;
  if (!title || !link) return res.status(400).json({ error: 'Title and link required' });
  
  const projects = readJSON(PROJECTS_FILE);
  const banner = req.file ? `/uploads/${req.file.filename}` : req.body.bannerUrl || '';
  
  const newProject = {
    id: uuidv4(),
    title,
    link,
    banner,
    category: category || 'General',
    createdAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  writeJSON(PROJECTS_FILE, projects);
  res.json(newProject);
});

// Delete project
app.delete('/api/admin/projects/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  let projects = readJSON(PROJECTS_FILE);
  const project = projects.find(p => p.id === id);
  
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  // Delete banner file if local
  if (project.banner && project.banner.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', project.banner);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  
  projects = projects.filter(p => p.id !== id);
  writeJSON(PROJECTS_FILE, projects);
  res.json({ success: true, message: 'Project deleted' });
});

// Update settings
app.put('/api/admin/settings', authMiddleware, (req, res) => {
  const { siteName, currentTheme, about, social, contact } = req.body;
  const settings = readJSON(SETTINGS_FILE);
  
  if (siteName) settings.siteName = siteName;
  if (currentTheme) settings.currentTheme = currentTheme;
  if (about) settings.about = { ...settings.about, ...about };
  if (social) settings.social = { ...settings.social, ...social };
  if (contact) settings.contact = { ...settings.contact, ...contact };
  
  writeJSON(SETTINGS_FILE, settings);
  res.json({ success: true, settings: { siteName: settings.siteName, currentTheme: settings.currentTheme } });
});

// Change admin password
app.put('/api/admin/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both passwords required' });
  }
  
  const settings = readJSON(SETTINGS_FILE);
  const isValid = bcrypt.compareSync(currentPassword, settings.adminPassword);
  if (!isValid) return res.status(401).json({ error: 'Current password incorrect' });
  
  settings.adminPassword = bcrypt.hashSync(newPassword, 10);
  writeJSON(SETTINGS_FILE, settings);
  res.json({ success: true, message: 'Password changed' });
});

// Get full settings (admin only)
app.get('/api/admin/settings', authMiddleware, (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  res.json(settings);
});

// Upload image (admin)
app.post('/api/admin/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Shadow Portfolio Backend running on port ${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`🌐 CORS enabled for all origins`);
});
