import { onReady } from './utils.js';
import { initNavigation } from './modules/navigation.js';
import { initSponsors } from './modules/sponsor.js';
import { initNews } from './modules/news.js';
import { initPartite } from './modules/partite.js';
import { initRose } from './modules/rose.js';
import { initDocumenti } from './modules/documenti.js';

onReady(async () => {
    initNavigation();
    initSponsors();
    initDocumenti();

    await Promise.allSettled([
        initNews(),
        initPartite(),
        initRose()
    ]);
});

