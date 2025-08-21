// Video player enhancements
import { eventManager } from '../core/events.js';
import { StorageManager } from '../core/storage.js';
import { Utils } from '../core/utils.js';
import { CONSTANTS } from '../core/constants.js';

export class PlayerManager {
    constructor() {
        this.currentPlayer = null;
        this.currentVideo = null;
        this.playbackSpeed = 1.0;
        this.aspectRatioIndex = 0;
        this.isAutoPaused = false;
        this.init();
    }

    init() {
        this.setupPlayerObserver();
        this.setupVisibilityHandling();
        eventManager.on('player:ready', this.onPlayerReady.bind(this));
    }

    setupPlayerObserver() {
        const observer = new MutationObserver(() => {
            this.detectPlayer();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial detection
        this.detectPlayer();
    }

    detectPlayer() {
        const videoElement = document.querySelector(CONSTANTS.SELECTORS.VIDEO_PLAYER);
        
        if (videoElement && videoElement !== this.currentVideo) {
            this.currentVideo = videoElement;
            this.setupVideoEvents();
            eventManager.emit('player:ready', videoElement);
        }
    }

    setupVideoEvents() {
        if (!this.currentVideo) return;

        this.currentVideo.addEventListener('loadstart', () => {
            eventManager.emit('player:loadstart');
        });

        this.currentVideo.addEventListener('play', () => {
            eventManager.emit('player:play');
        });

        this.currentVideo.addEventListener('pause', () => {
            eventManager.emit('player:pause');
        });

        this.currentVideo.addEventListener('timeupdate', () => {
            eventManager.emit('player:timeupdate', this.currentVideo.currentTime);
        });
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            const settings = StorageManager.getSettings();
            
            if (document.hidden && settings.autoPauseEnabled && this.currentVideo && !this.currentVideo.paused) {
                this.currentVideo.pause();
                this.isAutoPaused = true;
            } else if (!document.hidden && settings.autoResumeEnabled && this.isAutoPaused && this.currentVideo) {
                this.currentVideo.play();
                this.isAutoPaused = false;
            }
        });
    }

    onPlayerReady(videoElement) {
        console.log('Player ready:', videoElement);
        this.setupAutoSkip();
    }

    setupAutoSkip() {
        const settings = StorageManager.getSettings();
        
        if (settings.autoSkipIntro) {
            this.watchForSkipButton(CONSTANTS.SELECTORS.SKIP_INTRO_BUTTON);
        }
        
        if (settings.autoSkipOutro) {
            this.watchForSkipButton(CONSTANTS.SELECTORS.SKIP_OUTRO_BUTTON);
        }
    }

    watchForSkipButton(selector) {
        const observer = new MutationObserver(() => {
            const button = document.querySelector(selector);
            if (button && button.style.display !== 'none') {
                setTimeout(() => button.click(), 500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // Playback speed controls
    increaseSpeed() {
        if (!this.currentVideo) return;
        
        const speeds = CONSTANTS.DEFAULTS.PLAYBACK_SPEEDS;
        const currentIndex = speeds.indexOf(this.playbackSpeed);
        const nextIndex = Math.min(currentIndex + 1, speeds.length - 1);
        
        this.setPlaybackSpeed(speeds[nextIndex]);
    }

    decreaseSpeed() {
        if (!this.currentVideo) return;
        
        const speeds = CONSTANTS.DEFAULTS.PLAYBACK_SPEEDS;
        const currentIndex = speeds.indexOf(this.playbackSpeed);
        const nextIndex = Math.max(currentIndex - 1, 0);
        
        this.setPlaybackSpeed(speeds[nextIndex]);
    }

    resetSpeed() {
        this.setPlaybackSpeed(1.0);
    }

    setPlaybackSpeed(speed) {
        if (!this.currentVideo) return;
        
        this.playbackSpeed = speed;
        this.currentVideo.playbackRate = speed;
        eventManager.emit('player:speedChanged', speed);
    }

    // Aspect ratio controls
    cycleAspectRatio() {
        if (!this.currentVideo) return;
        
        const ratios = CONSTANTS.DEFAULTS.ASPECT_RATIOS;
        this.aspectRatioIndex = (this.aspectRatioIndex + 1) % ratios.length;
        const ratio = ratios[this.aspectRatioIndex];
        
        this.setAspectRatio(ratio);
    }

    setAspectRatio(ratio) {
        if (!this.currentVideo) return;
        
        const videoContainer = this.currentVideo.closest('.videoPlayerContainer');
        if (!videoContainer) return;
        
        videoContainer.classList.remove('auto', 'cover', 'fill');
        videoContainer.classList.add(ratio);
        
        eventManager.emit('player:aspectRatioChanged', ratio);
    }

    // Track cycling
    cycleSubtitleTracks() {
        const tracks = document.querySelectorAll(CONSTANTS.SELECTORS.SUBTITLE_TRACK);
        if (tracks.length === 0) return;
        
        // Find current active track
        let currentIndex = -1;
        tracks.forEach((track, index) => {
            if (track.classList.contains('selected')) {
                currentIndex = index;
            }
        });
        
        const nextIndex = (currentIndex + 1) % tracks.length;
        tracks[nextIndex].click();
    }

    cycleAudioTracks() {
        const tracks = document.querySelectorAll(CONSTANTS.SELECTORS.AUDIO_TRACK);
        if (tracks.length === 0) return;
        
        // Find current active track
        let currentIndex = -1;
        tracks.forEach((track, index) => {
            if (track.classList.contains('selected')) {
                currentIndex = index;
            }
        });
        
        const nextIndex = (currentIndex + 1) % tracks.length;
        tracks[nextIndex].click();
    }

    // Seek controls
    seekToPercentage(percentage) {
        if (!this.currentVideo || !this.currentVideo.duration) return;
        
        const time = (percentage / 100) * this.currentVideo.duration;
        this.currentVideo.currentTime = time;
    }

    // Info display
    showPlaybackInfo() {
        if (!this.currentVideo) return;
        
        const info = {
            currentTime: Utils.formatTime(this.currentVideo.currentTime),
            duration: Utils.formatTime(this.currentVideo.duration),
            playbackRate: this.playbackSpeed,
            volume: Math.round(this.currentVideo.volume * 100),
            buffered: this.getBufferedPercentage()
        };
        
        eventManager.emit('player:showInfo', info);
    }

    getBufferedPercentage() {
        if (!this.currentVideo || !this.currentVideo.buffered.length) return 0;
        
        const buffered = this.currentVideo.buffered;
        const currentTime = this.currentVideo.currentTime;
        
        for (let i = 0; i < buffered.length; i++) {
            if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
                return Math.round((buffered.end(i) / this.currentVideo.duration) * 100);
            }
        }
        
        return 0;
    }
}

// Global player manager instance
export const playerManager = new PlayerManager();