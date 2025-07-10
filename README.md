# Jellyfin Enhanced

![Jellyfin Enhanced](panel.png)

An enhanced userscript that adds powerful keyboard shortcuts, customizable subtitle styling, and smart auto-pause features to Jellyfin's web interface.

## ✨ Features

### ⌨️ Keyboard Shortcuts
- `?` — Shows the enhanced settings panel with all hotkeys and customization options
- `/` — Opens search page
- `A` — Cycle through aspect ratios (Auto → Cover → Fill) with visual feedback
- `I` — Shows playback info (stats overlay) (video page only)
- `S` — Shows subtitle selection menu (video page only)
- `C` — Cycle through subtitle tracks quickly (video page only)
- `V` — Cycle through audio tracks (video page only)
- `Shift+Esc` — Instantly return to Jellyfin Home Page

### 📝 Advanced Subtitle Customization
- **6 Style Presets**: Clean White, Classic Black Box, Netflix Style, Cinema Yellow, Soft Gray, High Contrast
- **5 Font Sizes**: Tiny, Small, Normal, Large, Extra Large
- **5 Font Families**: Default, Noto Sans, Sans Serif, Typewriter, Consolas
- **Live Preview**: See changes instantly with visual preview boxes
- **Persistent Settings**: Your preferences are saved automatically

### ⏯️ Smart Auto-Pause System
- **Configurable Auto-Pause**: Automatically pause when switching tabs or losing focus
- **Optional Auto-Resume**: Choose whether to resume playback when returning to the tab


## 🔧 Installation

You can install the script in one of below ways:

---

### **Method 1: Direct Integration**

*This method makes the enhancements available to all users on your Jellyfin server.*

1. **Locate your Jellyfin web root directory:**
   ```bash
   # Common paths:
   # Ubuntu/Debian: /usr/share/jellyfin/web/
   # Docker: /jellyfin/jellyfin-web/
   # Windows: C:\Program Files\Jellyfin\Server\jellyfin-web\
   ```

2. **Edit the index.html file:**
   ```bash
   sudo nano /usr/share/jellyfin/web/index.html
   ```

3. **Add the script reference before the closing `</head>` tag:**
   ```html
   <script defer src="hotkeys.js"></script>
   ```

4. **Download the enhanced script:**
   ```bash
   curl -o /usr/share/jellyfin/web/hotkeys.js https://raw.githubusercontent.com/n00bcodr/jellyfin-hotkeys/main/hotkeys.js
   ```

5. **Clear browser cache and reload Jellyfin**

> [!TIP]
> Check your Jellyfin server logs to find the exact web directory path for your installation.

---

### **Method 2: Plugin**

1. Install the [Custom JavaScript Plugin](https://github.com/johnpc/jellyfin-plugin-custom-javascript)

2. Navigate to **Dashboard -> Plugins -> Custom JavaScript**

3. Paste the contents of `hotkeys.js` into the text area

4. Restart Jellyfin

5. **Clear your browser cache** and **reload the Jellyfin Web Page**.

---

### **Method 3: Browser Extension (User-Specific)**

*This method works only in your browser and is perfect for personal use.*

1. **Install a userscript manager:**
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/) (Firefox)

2. **Install the script:**

   [![Install Script](https://img.shields.io/badge/Install%20Script-blue?style=for-the-badge)](https://github.com/n00bcodr/Jellyfin-Hotkeys/raw/main/jellyfin-hotkeys.user.js)

3. **Alternative manual installation:**
   - Create a new userscript in your extension
   - Copy and paste the contents from the repository
   - Save and enable the script

---

## 🎮 Usage Guide

### Getting Started
1. Navigate to any Jellyfin page and press `?` to open the settings panel
2. On a video page, customize subtitle styles, fonts, and auto-pause behavior to your preference
3. All settings are automatically saved and will persist across sessions

### Keyboard Shortcuts Quick Reference
| Key | Action | Context |
|-----|--------|---------|
| `?` | Open settings panel | Global |
| `/` | Open search | Global |
| `Shift + Esc` | Go to home | Global |
| `A` | Cycle aspect ratio | Video player |
| `I` | Show playback info | Video player |
| `S` | Subtitle menu | Video player |
| `C` | Cycle subtitle tracks | Video player |
| `V` | Cycle audio tracks | Video player |

### Customization Options
- **Subtitle Styles**: Choose from 6 carefully crafted presets
- **Font Sizes**: 5 size options from tiny to extra large
- **Font Families**: 5 different typefaces for optimal readability
- **Auto-Pause**: Enable/disable automatic pausing when tab loses focus
- **Auto-Resume**: Choose whether to resume playback automatically


## 🧪 Compatibility

**Tested and Verified:**
- Jellyfin 10.10.x Web UI
- Chrome/Chromium browsers + Tampermonkey
- Firefox + Violentmonkey/Greasemonkey


## 📄 License

MIT License - free to use, modify, and distribute.

---

<div align="center">

**Enjoying Jellyfin Enhanced Hotkeys?**

⭐ Star the repository | 🐛 Report issues | 💡 Suggest features

[GitHub Repository](https://github.com/n00bcodr/Jellyfin-hotkeys) • [Latest Release](https://github.com/n00bcodr/Jellyfin-hotkeys/releases)

</div>