# Jellyfin Enhanced

<p align="center">
  <img src="https://img.shields.io/github/last-commit/n00bcodr/Jellyfish/main?logo=semantic-release&logoColor=white&label=Last%20Updated&labelColor=black&color=AA5CC3&cacheSeconds=3600" alt="Last Updated">
  <img src="https://img.shields.io/github/commit-activity/w/n00bcodr/Jellyfish?logo=git&label=Commit%20Activity&labelColor=black&color=00A4DC&cacheSeconds=600" alt="Commit Activity">
  <img src="https://img.shields.io/badge/Jellyfin%20Version-10.10.7-AA5CC3?logo=jellyfin&logoColor=00A4DC&labelColor=black" alt="Jellyfin Version">
</p>
<br>

The ultimate enhancement for your Jellyfin experience. This plugin (previously script) combines the powerful features of Jellyfin Enhanced and [Jellyfin Elsewhere](https://github.com/n00bcodr/Jellyfin-Elsewhere/) into one easy-to-install package.

<img src="images/panel_jellyfish.gif" alt="Panel with Jellyfish Theme" width="90%" align="center"/>

<br><details>
<summary style="font-size: 1em; font-weight: 600;">Jellyfin Enhanced with Default Theme</summary>
<br>
<img src="images/panel.gif" width="800"/>
</details><br>

## ✨ Features

The Jellyfin Enhanced plugin brings a host of features to your Jellyfin web interface:

### ⌨️ Keyboard Shortcuts

| Key | Action | Context |
| :--- | :--- | :--- |
| **`?`** | Show/hide the settings & hotkey panel | Global |
| **`/`** | Focus the search bar | Global |
| **`Shift`** + **`H`** | Go to the Jellyfin Home Page | Global |
| **`D`** | Go to the Dashboard | Global |
| **`Q`** | Go to Quick Connect | Global |
| **`R`** | Play a random item from your library | Global |
| **Hold `Shift`** + **`B`** | Clear all saved bookmarks (3-second hold) | Global |
| :--- | :--- | :--- |
| **`A`** | Cycle through aspect ratios (Auto → Cover → Fill) | Player |
| **`I`** | Show playback info (stats overlay) | Player |
| **`S`** | Show the subtitle selection menu | Player |
| **`C`** | Cycle through available subtitle tracks | Player |
| **`V`** | Cycle through available audio tracks | Player |
| **`B`** | Bookmark the current playback time | Player |
| **`Shift`** + **`B`** | Go to the saved bookmark for the current item | Player |
| **`0`**-**`9`** | Jump to 0% - 90% of the video duration | Player |
| **`=`** / **`+`** | Increase playback speed | Player |
| **`-`** / **`_`** | Decrease playback speed | Player |
| **`R`** | Reset playback speed to normal (1.0x) | Player |

### 📝 Subtitle Settings
- **6 Style Presets**: Clean White, Classic Black Box, Netflix Style, Cinema Yellow, Soft Gray, High Contrast.
- **5 Font Sizes**: Tiny, Small, Normal, Large, Extra Large.
- **5 Font Families**: Default, Noto Sans, Sans Serif, Typewriter, Roboto.
- **Persistent Settings**: All choices are automatically saved and persist for the session.

### ⏯️ Smart Auto-Pause/Resume
- **Configurable Auto-Pause**: Automatically pause video when switching tabs.
- **Optional Auto-Resume**: Choose whether to resume playback upon returning to the tab.

### 🎲 Random Item Selection
- **Random Button**: Adds a "Random" button to the header for one-click access to a random item.
- **Configurable Item Types**: Choose to include Movies, Shows, or both.
- **Hotkey Support**: Press `R` (when not in the player) to instantly go to a random item.
- **Only show unwatched**: Option to only show unwatched items in the randomized result

### ↪️ Auto Skip Intro/Outro
- Options to automatically skip intro and outro for uninterrupted binge watching! (Dependent on Skip Intro Plugin!)

### 👁️ Remove from continue watching
- An option to remove items from the continue watching row!

### 🔍 Streaming Provider Information with multiple region search
- See where else your movies and shows are available to stream, right on the item details page.
- Configure your preferred default region and streaming services from the plugin settings and search more regions and services from the item details page!

### **And more...**
- File sizes - Display filesizes for each movie or episode in the item details page \
    ... and many more to come!


## 🔧 Installation

1.  In Jellyfin, go to **Dashboard** > **Plugins** > **Catalog** > ⚙️
2.  Click **➕** and give the repository a name (e.g., "JavaScript Injector Repo").
3.  Set the **Repository URL** to: `https://raw.githubusercontent.com/n00bcodr/jellyfin-enhanced/main/manifest.json`
4.  Click **Save**.
5.  Go to the **Catalog** tab, find **JavaScript Injector** in the list, and click **Install**.
6.  **Restart** your Jellyfin server to complete the installation.


#### 🐳 Docker Installation Notes

> [!NOTE]
> If you are on a docker install it is highly advisable to have [file-transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) at least v2.2.1.0 installed. It helps avoid permission issues while modifying index.html


If you're running Jellyfin through Docker, the plugin may not have permission to modify jellyfin-web to inject the script. If you see permission errors such as `'System.UnauthorizedAccessException: Access to the path '/usr/share/jellyfin/web/index.html' is denied.` in your logs, you will need to map the `index.html` file manually:

1. Copy the index.html file from your container:

   ```bash
   docker cp jellyfin:/usr/share/jellyfin/web/index.html /path/to/your/jellyfin/config/index.html
   ```

2. Add a volume mapping to your Docker run command:

   ```yaml
   -v /path/to/your/jellyfin/config/index.html:/usr/share/jellyfin/web/index.html
   ```

3. Or for Docker Compose, add this to your volumes section:
   ```yaml
   services:
     jellyfin:
       # ... other config
       volumes:
         - /path/to/your/jellyfin/config:/config
         - /path/to/your/jellyfin/config/index.html:/usr/share/jellyfin/web/index.html
         # ... other volumes
   ```

This gives the plugin the necessary permissions to inject JavaScript into the web interface.


<br>
<details>
<summary style="font-size: 1.25em; font-weight: 600;">Script Installation (OLD)</summary>
<br>

You can install the script using one of the methods below.

<p align="center">
----
</p>

### **Method 1: Browser Extension (for Personal Use)**

*This method works only in your browser and is perfect for personal use.*

1.  **Install a userscript manager:**
    * [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
    * [Violentmonkey](https://violentmonkey.github.io/)
    * [Greasemonkey](https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/) (Firefox)

2.  **Install the script:**

    [![Install Script](https://img.shields.io/badge/Install%20Script-blue?style=for-the-badge)](https://github.com/n00bcodr/Jellyfin-Enhanced/raw/main/jf_enhanced.user.js)

> [!WARNING]
> If you previously used `hotkeys.js`, please remove it from your userscripts to avoid conflicts.

<p align="center">
----
</p>

### **Method 2 (Recommended): Plugin (Server-Wide)**

1.  Install the [Jellyfin JavaScript Injector Plugin](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) and reboot your Jellyfin server.
2.  Navigate to **Dashboard -> Plugins -> JavaScript Injector**.
3.  Click on "Add Script"
4. Paste the contents of [jf_enhanced.js](jf_enhanced.js) into the script area.
   <br>
   **OR** <br>
   Paste the below code snippet to always pull the latest

   ```js
   (function() {
   'use strict';
   const scriptUrl = 'https://cdn.jsdelivr.net/gh/n00bcodr/Jellyfin-Enhanced@main/jf_enhanced.js';
   const script = document.createElement('script');
   script.src = scriptUrl;
   script.type = 'text/javascript';
   document.head.appendChild(script);
   })();

5.  Save and Refresh.

> [!NOTE]
> **Clear your cache** if you do not see changes reflect.

<p align="center">
----
</p>

### **Method 3: Direct Integration (Advanced, Server-Wide)**

*This method makes the enhancements available to all users on your server but requires direct file system access.*

1.  **Locate your Jellyfin web root directory:**
    * **Ubuntu/Debian**: `/usr/share/jellyfin/web/`
    * **Docker**: `/jellyfin/jellyfin-web/`
    * **Windows**: `C:\Program Files\Jellyfin\Server\jellyfin-web\`

2.  **Edit the `index.html` file:**
    ```bash
    sudo nano /usr/share/jellyfin/web/index.html
    ```

3.  **Add the script reference** before the closing `</head>` tag:
    ```html
    <script defer src="jf_enhanced.js"></script>
    ```

4.  **Download the script** into the web root directory:
    ```bash
    curl -o /usr/share/jellyfin/web/jf_enhanced.js [https://raw.githubusercontent.com/n00bcodr/jellyfin-enhanced/main/jf_enhanced.js](https://raw.githubusercontent.com/n00bcodr/jellyfin-enhanced/main/jf_enhanced.js)
    ```

5.  **Clear your browser cache** and reload Jellyfin.

</details>
---

## 🧪 Compatibility

- Official Jellyfin Web UI
- Official Jellyfin Android and iOS Apps
- Official Jellyfin Desktop Apps

This does not work on anything that does not use Jellyfin Embedded web UI, such as 3rd party apps, Android TV App etc.

## 📸 Screenshots

<table align="center">
  <tr>
    <th style="text-align:center">Shortcuts</th>
    <th style="text-align:center">Settings</th>
  </tr>
  <tr>
    <td><img src="images/shortcuts.png" width="1000"/></td>
    <td><img src="images/settings.png" width="1000"/></td>
  </tr>
  </table>


<br>
<details>
<summary style="font-size: 1.25em; font-weight: 600;">🎨 Custom Styling (For Any Theme)</summary>
<br>

While the script automatically themes itself with Jellyfish, you can apply your own custom look on any theme. The following CSS template can be used in a browser extension like Stylus to completely override the panel's appearance.

Sample styling

```css

    /*
    * ===================================================================
    * Universal Style Override for the Jellyfin Enhanced Panel if you are using
    * ===================================================================
    */

    /* Main Panel Container */
    #jellyfin-enhanced-panel {
    background: linear-gradient(135deg, #2c3e50, #1a2531) !important;
    border: 1px solid #567 !important;
    backdrop-filter: blur(5px) !important;
    color: #ecf0f1 !important;
    }

    /* Panel Header & Footer */
    #jellyfin-enhanced-panel > div:first-child,
    #jellyfin-enhanced-panel > div:last-child {
    background: rgba(0, 0, 0, 0.2) !important;
    border-color: rgba(136, 153, 170, 0.4) !important; /* Corresponds to #567 with opacity */
    }

    /* Main Title ("Jellyfin Enhanced") */
    #jellyfin-enhanced-panel div[style*="-webkit-background-clip: text"] {
    /* For gradient titles, otherwise use 'color' */
    background: linear-gradient(135deg, #1abc9c, #3498db) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    }

    /* Section Headers (e.g., "Global", "Player") and Accent Color for Details */
    #jellyfin-enhanced-panel h3,
    #jellyfin-enhanced-panel details summary {
    color: #1abc9c !important;
    }

    /* Collapsible <details> sections background */
    #jellyfin-enhanced-panel details {
        background-color: rgba(0, 0, 0, 0.15) !important;
    }

    /* Keyboard Key Styling (<kbd>) */
    #jellyfin-enhanced-panel kbd {
    background: #34495e !important;
    color: #ecf0f1 !important;
    border-radius: 4px !important;
    border: 1px solid #2c3e50 !important;
    }

    /* Style for Toast Notifications (after script edit) */
    .jellyfin-enhanced-toast {
        background: linear-gradient(135deg, #1abc9c, #16a085) !important;
        color: white !important;
        border: 1px solid #1abc9c !important;
    }

```

</details>

<details>
<summary style="font-size: 1.25em; font-weight: 600;">💻 Development </summary>
<br>

The original monolithic `plugin.js` has been refactored into a modular, component-based structure to improve maintainability, readability, and scalability. The new architecture uses a single entry point (`plugin.js`) that dynamically loads all other feature components.

### New File Structure

All client-side scripts are now located in the `Jellyfin.Plugin.JellyfinEnhanced/js/` directory.

```

Jellyfin.Plugin.JellyfinEnhanced/
└── js/
    ├── enhanced/
    │ ├── config.js
    │ ├── events.js
    │ ├── features.js
    │ ├── playback.js
    │ ├── subtitles.js
    │ └── ui.js
    ├── elsewhere.js
    ├── jellyseerr.js
    └── plugin.js
```


### Component Breakdown

* **`plugin.js`**: This is the new main entry point for the plugin. Its sole responsibility is to load the plugin configuration from the server and then dynamically inject the other component scripts into the page in the correct order.

* **`/enhanced/`**: This directory contains the core components of the "Jellyfin Enhanced" feature set.
    * **`config.js`**: Manages all settings, both from the plugin backend and the user's local storage. It initializes and holds shared variables and configurations that other components access.
    * **`subtitles.js`**: Isolates all logic related to subtitle styling, including presets and the function that applies styles to the video player.
    * **`ui.js`**: Responsible for creating, injecting, and managing all visual elements like the main settings panel, toast notifications, and various buttons.
    * **`playback.js`**: Centralizes all functions that directly control the video player, such as changing speed, seeking, cycling through tracks, and auto-skip logic.
    * **`features.js`**: Contains the logic for non-playback enhancements like the random item button, file size display, audio language display, and "Remove from Continue Watching".
    * **`events.js`**: The active hub of the plugin. It listens for user input (keyboard/mouse), browser events (tab switching), and DOM changes to trigger the appropriate functions from other components.

* **`elsewhere.js`**: A self-contained module for the "Jellyfin Elsewhere" feature, which finds where media is available on other streaming services.

* **`jellyseerr.js`**: A self-contained module for the Jellyseerr integration, including its UI, authentication, and API calls. It is loaded conditionally based on plugin settings.

</details>

## 📄 License

This project is licensed under the MIT License

---

<div align="center">

**Made with 💜 for Jellyfin and the community**

### Enjoying Jellyfin Enhanced?

Checkout my other repos!

[Jellyfin-Enhanced](https://github.com/n00bcodr/Jellyfin-Enhanced) (javascript/plugin) • [Jellyfin-Elsewhere](https://github.com/n00bcodr/Jellyfin-Elsewhere) (javascript) • [Jellyfin-Tweaks](https://github.com/n00bcodr/JellyfinTweaks) (plugin) • [Jellyfin-JavaScript-Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) (plugin) • [Jellyfish](https://github.com/n00bcodr/Jellyfish/) (theme)


</div>