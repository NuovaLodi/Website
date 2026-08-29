export function showPage(pageId) {
    if (document.body.dataset.siteArchitecture === 'multipage') {
        const routes = {
            home: 'pages/home.html',
            societa: 'pages/societa.html',
            squadre: 'pages/squadre.html',
            rosa: 'pages/rosa.html',
            iscrizioni: 'pages/iscrizioni.html',
            news: 'pages/news.html',
            sponsor: 'pages/sponsor.html',
            contatti: 'pages/contatti.html'
        };

        if (routes[pageId]) {
            window.location.href = new URL(routes[pageId], document.baseURI).href;
        }
        return;
    }

    const pages = ['home', 'societa', 'squadre', 'rosa', 'iscrizioni', 'news', 'contatti', 'sponsor'];
    pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.classList.add('hidden');
    });

    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) targetPage.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function closeNewsModal() {
    document.getElementById('news-modal')?.classList.add('hidden');
}

export function toggleMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
}

export function switchMatchTab(tab) {
    const matchesView = document.getElementById('tab-matches-view');
    const classificaView = document.getElementById('tab-classifica-view');
    const matchesBtn = document.getElementById('tab-matches-btn');
    const classificaBtn = document.getElementById('tab-classifica-btn');

    if (!matchesView) {
        return;
    }

    if (tab === 'matches') {
        matchesView.classList.remove('hidden');
        classificaView?.classList.add('hidden');
        if (matchesBtn) {
            matchesBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold transition-all bg-brandRed text-white';
        }
        classificaBtn?.classList.remove('bg-brandRed', 'text-white');
    } else {
        if (!classificaView || !classificaBtn) {
            return;
        }
        matchesView.classList.add('hidden');
        classificaView.classList.remove('hidden');
        classificaBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold transition-all bg-brandRed text-white';
        if (matchesBtn) {
            matchesBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold text-gray-400 hover:text-white transition-all';
        }
    }
}

export function initNavigation() {
    if (window.netlifyIdentity) {
        window.netlifyIdentity.on('init', user => {
            if (!user) {
                window.netlifyIdentity.on('login', () => {
                    document.location.href = '/admin/';
                });
            }
        });
    }
}

window.showPage = showPage;
window.closeNewsModal = closeNewsModal;
window.toggleMenu = toggleMenu;
window.switchMatchTab = switchMatchTab;
