# Jellyfin Hotkeys


- `/` — Opens search page
- `A` — Cycle through aspect ratios (Auto → Cover → Fill) and displays current mode (only on video page)
- `I` — Shows playback info (stats overlay) (only on video page)
- `Shift+Esc` — Instantly return to Jellyfin Home Page
- **Auto-pause** — Pauses playback when you switch tabs or the tab loses focus

## 🔧 Installation

You can install the script in one of two ways, depending on your setup:

---

### **Method 1: Injecting Directly into Jellyfin Web UI (Persistent for All Users)**

1. **Locate your Jellyfin web root directory.**
   _You can find the exact path in your Jellyfin server logs._

2. **Open the `index.html` file for editing:**
   ```bash
   sudo nano /usr/share/jellyfin/web/index.html
   ```

3. **Just before the </head> tag, insert this line:**
    ```html
    <script defer src="hotkeys.js"></script>
    ```

4. **Download the script directly into your web root using **``**:**

   ```bash
   curl -o /usr/share/jellyfin/web/hotkeys.js https://raw.githubusercontent.com/n00bcodr/jellyfin-hotkeys/main/hotkeys.js
   ```

5. **Clear your browser cache** and **reload the Jellyfin web page**.

<br>

> [!NOTE]
> Cross-check your jellyfin web path

<br>

---

### **Method 2: Browser-Only Installation Using a Userscript Manager**

*This method works only in the browser where you install it.*

1. **Install a userscript extension in your browser:**

   - [Tampermonkey](https://www.tampermonkey.net/)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/)

2. **Create a new userscript** in your extension’s dashboard and paste in the contents of the `jellyfin-hotkeys.user.js` script.

3. **Alternatively, you can click on Install below to open the script in Tampermonkey:**

[![Source](https://img.shields.io/badge/Source-green)](https://github.com/n00bcodr/Jellyfin-Hotkeys/blob/main/jellyfin-hotkeys.user.js)
[![Install](https://img.shields.io/badge/Install-blue)](https://github.com/n00bcodr/Jellyfin-Hotkeys/raw/main/jellyfin-hotkeys.user.js)


**Done!** The script will now run on Jellyfin’s web interface in that browser.


## 🧪 Tested On

- Jellyfin 10.9.x Web UI
- Chrome + Tampermonkey
- Firefox + Tampermonkey


## 📜 License

MIT — free to use, modify, share.
