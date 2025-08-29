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

### 🎬 Custom Pause Screen

The Custom Pause Screen is an immersive overlay that appears when you pause a video, providing detailed information about the content and a more polished look than the default player UI. This feature is a modified version of the original script by [BobHasNoSoul](https://github.com/BobHasNoSoul/Jellyfin-PauseScreen).

<p align="center">
  <img src="images/pausescreen.png" width="600" />
</p>

  This feature can be toggled on or off from the Jellyfin Enhanced settings panel under **Settings > Playback Settings > Custom Pause Screen**.


<br>
<details>
<summary style="font-size: 1.2em;">Pause Screen Customization Guide</summary>
<br>

If you do not want an element in the pause screen, you can customize by hiding them to your liking.

| Element | CSS Selector | Example CSS to Hide |
| --- | --- | --- |
| **Logo** | `#pause-screen-logo` | `#pause-screen-logo { display: none; }` |
| **Details** (Year, Rating, Runtime) | `#pause-screen-details` | `#pause-screen-details { display: none; }` |
| **Plot/Description** | `#pause-screen-plot` | `#pause-screen-plot { display: none; }` |
| **Entire Progress Bar** | `#pause-screen-progress-wrap` | `#pause-screen-progress-wrap { display: none; }` |
| **Spinning Disc** | `#pause-screen-disc` | `#pause-screen-disc { display: none; }` |
| **Blurred Backdrop** | `#pause-screen-backdrop` | `#pause-screen-backdrop { display: none; }` |
| **Time Display** (Current / Total) | `.progress-time` | `.progress-time { display: none; }` |
| **"Ends At" Time** | `.progress-ends-at` | `.progress-ends-at { display: none; }` |
| **Percentage Watched** | `.progress-percentage` | `.progress-percentage { display: none; }` |

</details><br>

### 🏷️ Quality Tags

This feature displays informative tags directly on item posters, giving you a quick overview of the media's technical specifications. This is a modified version of the original script by [BobHasNoSoul](https://github.com/BobHasNoSoul/Jellyfin-Qualitytags/).

> Needs some work, expect bugs and raise if you find any :)

This feature can be toggled on or off from the Jellyfin Enhanced settings panel under **Settings > UI Settings > Show Quality Tags**.

### **And more...**
- File sizes - Display filesizes for each movie or episode in the item details page \
    ... and many more to come!

<br>

<p align="center">
--------------------------------------------------
</p>

## Jellyseerr Search Integration <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/jellyseerr.svg" width="40" height="50" align="center">

The Jellyfin Enhanced plugin can integrate with your Jellyseerr instance, allowing users to search for and request media directly from the Jellyfin search interface.

#### Setup

To enable the Jellyseerr integration, you must first configure it in the plugin settings:

1. Navigate to **Dashboard > Plugins > Jellyfin Enhanced**.
2. Go to the **Jellyseerr Settings** tab.
3. Check the **Show Jellyseerr Results in Search** box to enable the feature.
4. Enter your **Jellyseerr URL(s)**, one per line. The plugin will use the first one that connects successfully. Should be the same Jellyseerr Instance. Intended for providing internal and external urls, ideally just internal URL should work.
5. Enter your **Jellyseerr API Key**. You can find this in Jellyseerr under **Settings > General > API Key**.
6. You can use the test button to see if your Jellyseerr instance is reachable.
7. Click **Save**.

<p align="center">
  <img src="images/jellyseerr.png" width="600" style="border-radius:25px;" />
</p>

> [!IMPORTANT]
> For the integration to work, you must also enable **"Enable Jellyfin Sign-In"** in your Jellyseerr User Settings (`/settings/users`).
> \
> <img src="images/jellyfin-signin.png" width="500" style="border-radius:25px;" /> \
> \
> All users who need access to request content must be imported into Jellyseerr as Jellyfin users.
> <table align="center">
> <tr><th style="text-align:center">Users that have access</th><th style="text-align:center">Users that don't have access (import them)</th>  </tr>  <tr>    <td><img src="images/users-with-access.png" width="300"/></td>    <td><img src="images/users-no-access.png" width="300"/></td>  </tr>  </table>

#### Icon States

When on the search page, a Jellyseerr icon will appear to indicate the connection status. This is the first thing to check when troubleshooting issues.

| Icon | State | Description |
| :---: | :--- | :--- |
|<img width="32" alt="active" src="https://github.com/user-attachments/assets/09124764-5132-4474-83e7-c09399630b13" /> | **Active** | Jellyseerr is successfully connected, and the current Jellyfin user is correctly linked to a Jellyseerr user. <br> Results from Jellyseerr will load along with Jellyfin and requests can be made. |
| <img width="32" alt="noaccess" src="https://github.com/user-attachments/assets/0db72189-04fc-4ec1-bdf1-50dd5e36d2ef" /> | **User Not Found** | Jellyseerr is successfully connected, but the current Jellyfin user is not linked to a Jellyseerr account. <br>Ensure the user has been imported into Jellyseerr from Jellyfin. Results will not load. |
| <img width="32" alt="offline" src="https://github.com/user-attachments/assets/0e109ec3-038c-4471-97c1-9cc38bcd26c5" /> | **Offline** | The plugin could not connect to any of the configured Jellyseerr URLs. <br> Check your plugin settings and ensure Jellyseerr is running and accessible. Results will not load. |


---


<br>

### How It Works?

To ensure security and prevent browser-related Cross-Origin Resource Sharing (CORS) errors, the Jellyfin Enhanced plugin does not communicate directly with the Jellyseerr API from your browser. Instead, it uses the Jellyfin server as a proxy. This method keeps your Jellyseerr API key safe on the server and avoids security issues.

In doing so, the plugin exposes a few proxy endpoints for its own use and for troubleshooting.

<br>
<details>
<summary style="font-size: 1.25em; font-weight: 600;">🔌 Jellyseerr API Endpoints</summary>
<br>

You can use these `curl` commands to directly interact with the plugin's API for troubleshooting. You will need to replace the placeholder values with your own.

#### Get Plugin Version

This endpoint checks the installed version of the Jellyfin Enhanced plugin.

```bash
curl -X GET\
  "<JELLYFIN_ADDRESS>/JellyfinEnhanced/version"
```

<br/>

#### Get Jellyseerr Connection Status

Checks if the plugin can connect to any of the configured Jellyseerr URLs using the provided API key.

```bash
curl -X GET\
  -H "X-Emby-Token: <JELLYFIN_API_KEY>"\
  "<JELLYFIN_ADDRESS>/JellyfinEnhanced/jellyseerr/status"
```

<br/>

#### Get Jellyseerr User Status

Verifies that the currently logged-in Jellyfin user is successfully linked to a Jellyseerr user account.

```bash
curl -X GET\
  -H "X-Emby-Token: <JELLYFIN_API_KEY>"\
  -H "X-Jellyfin-User-Id: <JELLYFIN_USER_ID>"\
  "<JELLYFIN_ADDRESS>/JellyfinEnhanced/jellyseerr/user-status"
```

<br/>

#### Perform a Jellyseerr Search

Executes a search query through the Jellyseerr instance for the specified user.

```bash
curl -X GET\
  -H "X-Emby-Token: <JELLYFIN_API_KEY>"\
  -H "X-Jellyfin-User-Id: <JELLYFIN_USER_ID>"\
  "<JELLYFIN_ADDRESS>/JellyfinEnhanced/jellyseerr/search?query=Inception"
```

<br/>

#### Make a Request on Jellyseerr

Submits a media request to Jellyseerr on behalf of the specified user. \
mediaType can be `tv` or `movie` \
mediaId is the TMDB ID of the item

```bash
curl -X POST\
  -H "X-Emby-Token: <JELLYFIN_API_KEY>"\
  -H "X-Jellyfin-User-Id: <JELLYFIN_USER_ID>"\
  -H "Content-Type: application/json"\
  -d '{"mediaType": "movie", "mediaId": 27205}'\
  "<JELLYFIN_ADDRESS>/JellyfinEnhanced/jellyseerr/request"
```

</details>

## 🔧 Installation

1.  In Jellyfin, go to **Dashboard** > **Plugins** > **Catalog** > ⚙️
2.  Click **➕** and give the repository a name (e.g., "Jellyfin Enhanced").
3.  Set the **Repository URL** to: `https://raw.githubusercontent.com/n00bcodr/jellyfin-enhanced/main/manifest.json`
4.  Click **Save**.
5.  Go to the **Catalog** tab, find **Jellyfin Enhanced** in the list, and click **Install**.
6.  **Restart** your Jellyfin server to complete the installation.


#### 🐳 Docker Installation Notes

  > [!NOTE]
  > If you are on a docker install it is highly advisable to have [file-transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) at least v2.2.1.0 installed. It helps avoid permission issues while modifying index.html


If you're running Jellyfin through Docker, the plugin may not have permission to modify jellyfin-web to inject the script. If you see permission errors such as `'System.UnauthorizedAccessException: Access to the path '/jellyfin/jellyfin-web/index.html ' is denied.` in your logs, you will need to map the `index.html` file manually:

1. Copy the index.html file from your container:

   ```bash
   docker cp jellyfin:/jellyfin/jellyfin-web/index.html /path/to/your/jellyfin/config/index.html
   ```

2. Add a volume mapping to your Docker run command:

   ```yaml
   -v /path/to/your/jellyfin/config/index.html:/jellyfin/jellyfin-web/index.html
   ```

3. Or for Docker Compose, add this to your volumes section:
   ```yaml
   services:
     jellyfin:
       # ... other config
       volumes:
         - /path/to/your/jellyfin/config:/config
         - /path/to/your/jellyfin/config/index.html:/jellyfin/jellyfin-web/index.html
         # ... other volumes
   ```

This gives the plugin the necessary permissions to inject JavaScript into the web interface.

---
💡 FAQ & Troubleshooting
------------------------

Here are some common questions and solutions for issues you might encounter with the Jellyfin Enhanced plugin.

### Frequently Asked Questions

**Q: Can I customize the keyboard shortcuts?** \
 **A:** Yes, you can! Open the Jellyfin Enhanced panel by clicking the menu item in the sidebar or pressing `?`. In the "Shortcuts" tab, you can click on any key to set a new custom shortcut.

**Q: Does this plugin work on the Jellyfin mobile app?** \
**A:** Yes, the plugin is compatible with the official Jellyfin Android and iOS apps, as well as the desktop and web UIs.

**Q: Does this plugin work on the Android TV or any other TV?** \
**A:** No, this plugin does not work on the native Jellyfin app for Android TV, or other similar TV platforms. The plugin taps into the Jellyfin web interface, so it only functions on clients that use the embedded web UI, such as the official Web, Desktop, and mobile apps.

**Q: Why is the "Remove from Continue Watching" feature a destructive action?** \
**A:** This feature works by resetting the playback progress of an item to zero. While this removes it from the "Continue Watching" list, it also means the user's watch history for that item is lost.

**Q: Where is the userscript?** \
**A:** With the plugin functionality growing and diverging from the userscript, I had to remove it and installation method to avoid confusion. But if you just want the keyboard shortcuts and other functionality, the last updated version is [**here**](https://github.com/n00bcodr/Jellyfin-Enhanced/raw/05dd5b54802f149e45c76102dabf6235aaf7a5fb/jf_enhanced.user.js)

### Troubleshooting Guide

Here is a list of common errors you might see in your Jellyfin server logs or your browser's developer console, and what they mean.

#### Server Logs (`Jellyfin Server Dashboard > Logs`)

| Error Message | Meaning & Solution |
| --- | --- |
| `Access to the path '/jellyfin/jellyfin-web/index.html ' is denied.` | **Meaning:** The plugin was unable to edit the `index.html` file to inject its script. <br> **Solution:** This is common in Docker installs. Follow the **Docker Installation Notes** in the README to correctly map the `index.html` file or use file-transformation plugin. |

.
.
.
.
---

## 🧪 Compatibility

- Official Jellyfin Web UI
- Official Jellyfin Android and iOS Apps
- Official Jellyfin Desktop Apps

> [!NOTE]
> This does not work on anything that does not use Jellyfin Embedded web UI, such as 3rd party apps, Android TV App etc.

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
    * Universal Style Override for the Jellyfin Enhanced Panel
    * ===================================================================
    */

    /* --- Main Panel & Backdrop --- */
    #jellyfin-enhanced-panel {
        background: rgba(25, 35, 45, 0.85) !important;
        border: 1px solid rgba(125, 150, 175, 0.3) !important;
        backdrop-filter: blur(20px) !important;
        color: #e6e6e6 !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
    }

    /* --- Panel Header --- */
    #jellyfin-enhanced-panel > div:first-child {
        background: rgba(0, 0, 0, 0.25) !important;
        border-bottom: 1px solid rgba(125, 150, 175, 0.3) !important;
    }

    /* --- Main Title ("Jellyfin Enhanced") --- */
    #jellyfin-enhanced-panel div[style*="-webkit-background-clip: text"] {
        background: linear-gradient(135deg, #00a4dc, #aa5cc3) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
    }

    /* --- Tab Buttons --- */
    #jellyfin-enhanced-panel .tab-button {
        background: rgba(0, 0, 0, 0.2) !important;
        color: rgba(255, 255, 255, 0.6) !important;
        border-bottom: 3px solid transparent !important;
    }

    #jellyfin-enhanced-panel .tab-button:hover {
        background: rgba(0, 0, 0, 0.4) !important;
        color: #ffffff !important;
    }

    #jellyfin-enhanced-panel .tab-button.active {
        color: #ffffff !important;
        border-bottom-color: #00a4dc !important;
        background: rgba(0, 0, 0, 0.3) !important;
    }

    /* --- Section Headers & <details> Summary --- */
    #jellyfin-enhanced-panel h3,
    #jellyfin-enhanced-panel details summary {
        color: #00a4dc !important;
    }

    /* --- Collapsible <details> Sections --- */
    #jellyfin-enhanced-panel details {
        background-color: rgba(0, 0, 0, 0.2) !important;
        border: 1px solid rgba(125, 150, 175, 0.2) !important;
    }

    /* --- Keyboard Key Styling (<kbd>) --- */
    #jellyfin-enhanced-panel kbd,
    .shortcut-key {
        background: #34495e !important;
        color: #ecf0f1 !important;
        border: 1px solid #2c3e50 !important;
        box-shadow: 0 2px 0 #2c3e50;
    }

    /* --- Toggles & Checkboxes --- */
    #jellyfin-enhanced-panel input[type="checkbox"] {
        accent-color: #aa5cc3 !important;
    }

    /* --- Panel Footer --- */
    #jellyfin-enhanced-panel .panel-footer {
        background: rgba(0, 0, 0, 0.25) !important;
        border-top: 1px solid rgba(125, 150, 175, 0.3) !important;
    }

    /* --- Buttons in Footer --- */
    #jellyfin-enhanced-panel .footer-buttons a,
    #jellyfin-enhanced-panel .footer-buttons button {
        background-color: rgba(255, 255, 255, 0.08) !important;
        transition: background-color 0.2s ease;
    }

    #jellyfin-enhanced-panel .footer-buttons a:hover,
    #jellyfin-enhanced-panel .footer-buttons button:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
    }

    /* --- Style for Toast Notifications --- */
    .jellyfin-enhanced-toast {
        background: linear-gradient(135deg, #00a4dc, #aa5cc3) !important;
        color: white !important;
        border: none !important;
        backdrop-filter: blur(10px) !important;
    }

```

</details>
<br><br>
<details>
<summary style="font-size: 1.25em; font-weight: 600;">🫚Project Structure </summary>
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
