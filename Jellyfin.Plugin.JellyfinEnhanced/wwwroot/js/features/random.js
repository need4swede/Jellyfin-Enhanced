// Random item selection
import { StorageManager } from '../core/storage.js';
import { Utils } from '../core/utils.js';
import { eventManager } from '../core/events.js';

export class RandomManager {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        this.addRandomButton();
    }

    addRandomButton() {
        const settings = StorageManager.getSettings();
        if (!settings.randomButtonEnabled) return;

        Utils.waitForElement('.headerTop .headerLeft')
            .then(headerLeft => {
                if (document.querySelector('#jellyfin-enhanced-random-btn')) return;

                const randomBtn = Utils.createElement('button', {
                    id: 'jellyfin-enhanced-random-btn',
                    className: 'headerButton headerButtonRight',
                    innerHTML: '🎲',
                    title: 'Play Random Item (R)',
                    style: 'font-size: 1.2em; margin-right: 0.5em;'
                });

                randomBtn.addEventListener('click', () => this.playRandomItem());
                headerLeft.appendChild(randomBtn);
            })
            .catch(() => {
                console.warn('Could not add random button - header not found');
            });
    }

    async playRandomItem() {
        if (this.isLoading) return;

        this.isLoading = true;
        eventManager.emit('random:loading', true);

        try {
            const randomItem = await this.getRandomItem();
            if (randomItem) {
                this.navigateToItem(randomItem);
                eventManager.emit('random:success', randomItem);
            } else {
                eventManager.emit('random:noItems');
            }
        } catch (error) {
            console.error('Error getting random item:', error);
            eventManager.emit('random:error', error);
        } finally {
            this.isLoading = false;
            eventManager.emit('random:loading', false);
        }
    }

    async getRandomItem() {
        const settings = StorageManager.getSettings();
        const user = Utils.getCurrentUser();
        
        if (!user) {
            throw new Error('No user found');
        }

        const includeTypes = [];
        if (settings.randomIncludeMovies) includeTypes.push('Movie');
        if (settings.randomIncludeShows) includeTypes.push('Series');

        if (includeTypes.length === 0) {
            throw new Error('No item types selected for random selection');
        }

        const params = new URLSearchParams({
            UserId: user.Id,
            IncludeItemTypes: includeTypes.join(','),
            Recursive: 'true',
            SortBy: 'Random',
            Limit: '1',
            Fields: 'BasicSyncInfo'
        });

        if (settings.randomUnwatchedOnly) {
            params.append('IsPlayed', 'false');
        }

        const response = await Utils.makeApiRequest(`/Items?${params.toString()}`);
        return response.Items && response.Items.length > 0 ? response.Items[0] : null;
    }

    navigateToItem(item) {
        if (!item) return;

        let url;
        if (item.Type === 'Movie') {
            url = `/web/index.html#!/details?id=${item.Id}`;
        } else if (item.Type === 'Series') {
            url = `/web/index.html#!/details?id=${item.Id}`;
        } else {
            console.warn('Unknown item type for navigation:', item.Type);
            return;
        }

        window.location.href = url;
    }

    updateButtonVisibility() {
        const settings = StorageManager.getSettings();
        const button = document.querySelector('#jellyfin-enhanced-random-btn');
        
        if (button) {
            button.style.display = settings.randomButtonEnabled ? 'block' : 'none';
        } else if (settings.randomButtonEnabled) {
            this.addRandomButton();
        }
    }
}

// Global random manager instance
export const randomManager = new RandomManager();