/* Generated compatibility bundle. Source files are in js/modules. */

/* js/config.js */
const CONFIG = {
    github: {
        owner: 'NuovaLodi',
        repository: 'Website',
        branch: 'main'
    },
    content: {
        news: 'content/news',
        partite: 'content/partite',
        rose: 'content/rose',
        documenti: 'documenti'
    },
    manifest: 'content/manifest.json'
};


/* js/github.js */

const API_BASE = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repository}/contents`;
let manifestCache = null;

async function loadManifest() {
    if (manifestCache) {
        return manifestCache;
    }

    if (shouldUseLocalContentFirst() && window.NUOVA_LODI_CONTENT) {
        manifestCache = window.NUOVA_LODI_CONTENT;
        return manifestCache;
    }

    const response = await fetch(CONFIG.manifest, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error(`Manifest non disponibile: ${response.status}`);
    }

    manifestCache = await response.json();
    return manifestCache;
}

function shouldUseLocalContentFirst() {
    return (
        window.location.protocol === 'file:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    );
}

async function listFolder(path) {
    let manifest = null;

    if (shouldUseLocalContentFirst()) {
        manifest = await loadManifest().catch(() => null);
        const localFiles = manifest?.[path];

        if (localFiles) {
            return localFiles;
        }
    }

    try {
        const response = await fetch(`${API_BASE}/${path}?ref=${CONFIG.github.branch}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Errore risposta GitHub: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        if (!manifest) {
            manifest = await loadManifest().catch(() => null);
        }

        const fallbackFiles = manifest?.[path];

        if (!fallbackFiles) {
            throw error;
        }

        console.warn(`Uso manifest locale per ${path}:`, error.message);
        return fallbackFiles;
    }
}

async function getTextFile(file) {
    if (typeof file.text === 'string') {
        return file.text;
    }

    const response = await fetch(file.download_url, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Errore lettura file ${file.name}: ${response.status}`);
    }

    return response.text();
}

function parseFrontmatter(text) {
    const data = {};
    const frontmatterMatch = text.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);

    if (!frontmatterMatch) {
        return { data, body: text.trim() };
    }

    frontmatterMatch[1].split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            value = value.replace(/^["']|["']$/g, '');
            if (key) data[key] = value;
        }
    });

    const body = text.replace(/^---\s*[\r\n]+[\s\S]*?[\r\n]+---/, '').trim();
    return { data, body };
}

async function loadJsonOrFrontmatter(file) {
    const text = await getTextFile(file);

    if (file.name.endsWith('.json')) {
        return JSON.parse(text);
    }

    const parsed = parseFrontmatter(text);
    return { ...parsed.data, bodyContent: parsed.body };
}


/* js/utils.js */
function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function formatItalianDate(date, options = {}) {
    if (!date || isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString('it-IT', options);
}

function formatItalianTime(date) {
    if (!date || isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
}



/* js/modules/navigation.js */
function showPage(pageId) {
    const pages = ['home', 'societa', 'squadre', 'rosa', 'iscrizioni', 'news', 'contatti', 'sponsor'];
    pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.classList.add('hidden');
    });

    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) targetPage.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeNewsModal() {
    document.getElementById('news-modal')?.classList.add('hidden');
}

function toggleMenu() {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
}

function switchMatchTab(tab) {
    const matchesView = document.getElementById('tab-matches-view');
    const classificaView = document.getElementById('tab-classifica-view');
    const matchesBtn = document.getElementById('tab-matches-btn');
    const classificaBtn = document.getElementById('tab-classifica-btn');

    if (!matchesView || !classificaView || !matchesBtn || !classificaBtn) {
        return;
    }

    if (tab === 'matches') {
        matchesView.classList.remove('hidden');
        classificaView.classList.add('hidden');
        matchesBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold transition-all bg-brandRed text-white';
        classificaBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold text-gray-400 hover:text-white transition-all';
    } else {
        matchesView.classList.add('hidden');
        classificaView.classList.remove('hidden');
        classificaBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold transition-all bg-brandRed text-white';
        matchesBtn.className = 'px-3 py-1 rounded text-[11px] md:text-xs font-bold text-gray-400 hover:text-white transition-all';
    }
}

function initNavigation() {
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



/* js/modules/classifica.js */
function initTeam(classificaMap, nome) {
    if (!classificaMap[nome]) {
        classificaMap[nome] = { nome, giocati: 0, vinti: 0, pari: 0, persi: 0, punti: 0 };
    }
}

function aggiornaClassifica(classificaMap, casa, ospite, gCasa, gOspite) {
    if (gCasa === null || gOspite === null || isNaN(gCasa) || isNaN(gOspite)) {
        return;
    }

    initTeam(classificaMap, casa);
    initTeam(classificaMap, ospite);

    classificaMap[casa].giocati++;
    classificaMap[ospite].giocati++;

    if (gCasa > gOspite) {
        classificaMap[casa].vinti++;
        classificaMap[casa].punti += 3;
        classificaMap[ospite].persi++;
    } else if (gCasa < gOspite) {
        classificaMap[ospite].vinti++;
        classificaMap[ospite].punti += 3;
        classificaMap[casa].persi++;
    } else {
        classificaMap[casa].pari++;
        classificaMap[casa].punti += 1;
        classificaMap[ospite].pari++;
        classificaMap[ospite].punti += 1;
    }
}

function renderClassifica(classificaMap) {
    const classificaTbody = document.getElementById('classificaTableBody');
    if (!classificaTbody) {
        return;
    }

    const classificaArray = Object.values(classificaMap).sort((a, b) => b.punti - a.punti || b.vinti - a.vinti);
    if (classificaArray.length === 0) {
        classificaTbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-gray-500">Nessun dato di classifica disponibile al momento.</td></tr>`;
        return;
    }

    classificaTbody.innerHTML = classificaArray.map((t, idx) => {
        const isNuovaLodi = t.nome.toLowerCase().includes('lodi');
        return `
        <tr class="${isNuovaLodi ? 'bg-red-50/80 font-bold text-brandRed' : 'hover:bg-gray-50'} transition">
            <td class="py-2.5 px-3 font-bold">${idx + 1}</td>
            <td class="py-2.5 px-3 flex items-center gap-2">
                ${isNuovaLodi ? '<span class="w-2 h-2 rounded-full bg-brandRed"></span>' : ''}
                ${t.nome}
            </td>
            <td class="py-2.5 px-3 text-center text-gray-600">${t.giocati}</td>
            <td class="py-2.5 px-3 text-center text-gray-600">${t.vinti}</td>
            <td class="py-2.5 px-3 text-center text-gray-600">${t.pari}</td>
            <td class="py-2.5 px-3 text-center text-gray-600">${t.persi}</td>
            <td class="py-2.5 px-3 text-center font-extrabold text-brandDark text-sm">${t.punti}</td>
        </tr>`;
    }).join('');
}



/* js/modules/sponsor.js */
const sponsorData = [
    {
        id: 1,
        nome: 'Banca Popolare di Lodi',
        tipo: 'main',
        descrizione: 'Sostenitore principale delle nostre squadre giovanili e delle strutture sportive.',
        sito: 'https://www.bancobpm.it',
        logoText: 'BPL BANCA'
    },
    {
        id: 2,
        nome: 'Lodi Sport & Fitness',
        tipo: 'main',
        descrizione: 'Fornitore ufficiale di abbigliamento e attrezzatura tecnica per la stagione.',
        sito: '#',
        logoText: 'LODI SPORT'
    },
    {
        id: 3,
        nome: 'Gruppo Immobiliare Laudense',
        tipo: 'main',
        descrizione: 'Partner etico per i progetti sociali e la tutela dei giovani atleti.',
        sito: '#',
        logoText: 'IMMOBILIARE'
    },
    { id: 4, nome: 'Farmacia San Francesco', tipo: 'sostenitore', sito: '#' },
    { id: 5, nome: 'Pizzeria Cabrini', tipo: 'sostenitore', sito: '#' },
    { id: 6, nome: 'Autofficina Lodigiana', tipo: 'sostenitore', sito: '#' },
    { id: 7, nome: 'Ottica Archinti', tipo: 'sostenitore', sito: '#' },
    { id: 8, nome: 'Caffè della Piazza', tipo: 'sostenitore', sito: '#' },
    { id: 9, nome: 'Macelleria Rossi', tipo: 'sostenitore', sito: '#' }
];

function createMainSponsorCard(sponsor) {
    return `
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col justify-between hover:border-brandRed transition">
            <div class="space-y-4">
                <div class="h-28 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                    <span class="font-black text-xl text-gray-500 uppercase tracking-wider">${sponsor.logoText || sponsor.nome}</span>
                </div>
                <div>
                    <h3 class="font-extrabold text-brandDark text-base uppercase">${sponsor.nome}</h3>
                    <p class="text-xs text-gray-600 mt-1 leading-relaxed">${sponsor.descrizione}</p>
                </div>
            </div>
            ${sponsor.sito !== '#' ? `
                <div class="pt-4 mt-2 border-t border-gray-100">
                    <a href="${sponsor.sito}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-brandRed hover:underline inline-flex items-center gap-1">
                        Visita il sito <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </a>
                </div>
            ` : ''}
        </div>
    `;
}

function createSostenitoreCard(sponsor) {
    return `
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center flex items-center justify-center hover:border-brandRed transition h-20">
            <span class="font-extrabold text-xs text-brandDark uppercase">${sponsor.nome}</span>
        </div>
    `;
}

function renderSponsors() {
    const mainSponsors = sponsorData.filter(s => s.tipo === 'main');
    const sostenitori = sponsorData.filter(s => s.tipo === 'sostenitore');

    const homeContainer = document.getElementById('home-sponsors-container');
    if (homeContainer) {
        homeContainer.innerHTML = mainSponsors.map(createMainSponsorCard).join('');
    }

    const pageMainContainer = document.getElementById('page-main-sponsors-container');
    if (pageMainContainer) {
        pageMainContainer.innerHTML = mainSponsors.map(createMainSponsorCard).join('');
    }

    const pageSostenitoriContainer = document.getElementById('page-sostenitori-container');
    if (pageSostenitoriContainer) {
        pageSostenitoriContainer.innerHTML = sostenitori.map(createSostenitoreCard).join('');
    }
}

function initSponsors() {
    renderSponsors();
}


/* js/modules/news.js */

function normalizeImagePath(image) {
    if (!image) {
        return '';
    }

    const imagePath = image.toString().trim();

    if (!imagePath) {
        return '';
    }

    if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:')) {
        return imagePath;
    }

    return imagePath.replace(/^\/+/, '');
}

function escapeHTML(value) {
    return (value || '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createNewsImageHTML(item) {
    const image = normalizeImagePath(item.image);

    if (!image) {
        return `
                    <div class="h-44 bg-gray-200 flex items-center justify-center text-gray-400">
                        <i class="fa-solid fa-newspaper text-3xl"></i>
                    </div>`;
    }

    return `
                    <div class="h-44 bg-gray-200 overflow-hidden">
                        <img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover" loading="lazy" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');">
                        <div class="hidden flex w-full h-full items-center justify-center text-gray-400">
                            <i class="fa-solid fa-newspaper text-3xl"></i>
                        </div>
                    </div>`;
}

async function loadDynamicNews() {
    const homeContainer = document.getElementById('home-news-container');
    const newsContainer = document.getElementById('news-container');
    const countBadge = document.getElementById('news-count-badge');

    const loadingHTML = '<p class="col-span-full text-center text-gray-400 py-8">Caricamento notizie in corso...</p>';
    if (homeContainer) homeContainer.innerHTML = loadingHTML;
    if (newsContainer) newsContainer.innerHTML = loadingHTML;

    try {
        const files = await listFolder(CONFIG.content.news);
        const newsFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));

        if (newsFiles.length === 0) {
            const emptyMsg = '<p class="col-span-full text-center text-gray-500 py-8">Nessuna notizia presente al momento.</p>';
            if (homeContainer) homeContainer.innerHTML = emptyMsg;
            if (newsContainer) newsContainer.innerHTML = emptyMsg;
            return;
        }

        const newsList = [];

        for (const file of newsFiles) {
            const news = await loadJsonOrFrontmatter(file);

            if (!news.summary && news.bodyContent) {
                news.summary = news.bodyContent.replace(/[#*`_]/g, '').substring(0, 120) + '...';
            }

            const rawDate = news.date || news.data || news.published_at || '';
            const dateObj = rawDate ? new Date(rawDate) : new Date(0);

            newsList.push({
                title: news.title || news.titolo || news.heading || 'Senza Titolo',
                summary: news.summary || news.description || news.sommario || news.estratto || '',
                body: news.body || news.bodyContent || news.testoCompleto || news.summary || '',
                image: news.image || news.immagine || news.foto || news.thumbnail || news.cover || '',
                category: news.category || news.categoria || 'News',
                dateObj: dateObj,
                dateFormatted: (!isNaN(dateObj) && dateObj.getTime() !== 0)
                    ? dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
                    : ''
            });
        }

        newsList.sort((a, b) => b.dateObj - a.dateObj);

        const createCardHTML = (item, index) => `
            <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div>
                    ${createNewsImageHTML(item)}
                    <div class="p-5 space-y-2">
                        <span class="text-[11px] font-bold bg-brandRed/10 text-brandRed px-2 py-0.5 rounded">${item.category}</span>
                        ${item.dateFormatted ? `<span class="text-[11px] text-gray-400 block float-right">${item.dateFormatted}</span>` : ''}
                        <h3 class="font-extrabold text-brandDark text-base leading-snug pt-1">${item.title}</h3>
                        <p class="text-gray-600 text-xs line-clamp-3">${item.summary}</p>
                    </div>
                </div>
                <div class="p-5 pt-0">
                    <button onclick="openDynamicModal(${index})" class="text-xs font-bold text-brandRed hover:underline flex items-center gap-1">
                        Leggi di più <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        `;

        window.loadedNews = newsList;

        if (homeContainer) {
            const top3 = newsList.slice(0, 3);
            homeContainer.innerHTML = top3.map((item, idx) => createCardHTML(item, idx)).join('');
        }

        if (newsContainer) {
            newsContainer.innerHTML = newsList.map((item, idx) => createCardHTML(item, idx)).join('');
        }

        if (countBadge) {
            countBadge.innerText = `Totale notizie: ${newsList.length}`;
        }

    } catch (err) {
        console.error('Errore nel caricamento notizie:', err);
        const errorMsg = '<p class="col-span-full text-center text-red-500 py-8">Impossibile caricare le notizie da GitHub.</p>';
        if (homeContainer) homeContainer.innerHTML = errorMsg;
        if (newsContainer) newsContainer.innerHTML = errorMsg;
    }
}

function openDynamicModal(index) {
    const item = window.loadedNews && window.loadedNews[index];
    if (!item) return;

    const titleEl = document.getElementById('modal-title');
    const dateEl = document.getElementById('modal-date');
    const catEl = document.getElementById('modal-category');
    const bodyEl = document.getElementById('modal-body');
    const modal = document.getElementById('news-modal');

    if (titleEl) titleEl.innerText = item.title;
    if (dateEl) dateEl.innerText = item.dateFormatted;
    if (catEl) catEl.innerText = item.category;
    if (bodyEl) bodyEl.innerHTML = `<p class="whitespace-pre-line text-gray-700">${item.body}</p>`;

    if (modal) modal.classList.remove('hidden');
}

function initNews() {
    return loadDynamicNews();
}

window.loadDynamicNews = loadDynamicNews;
window.openDynamicModal = openDynamicModal;



/* js/modules/partite.js */

async function loadPartiteFiles() {
    const files = await listFolder(CONFIG.content.partite);
    return files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));
}

function parseMatchDate(match) {
    let formattedDate = '';
    let formattedTime = '';
    let timestamp = 0;

    if (match.dataOra) {
        const d = new Date(match.dataOra);
        if (!isNaN(d.getTime())) {
            timestamp = d.getTime();
            formattedDate = d.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            formattedTime = d.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    return { formattedDate, formattedTime, timestamp };
}

async function openCalendarioModal(categoriaSquadra) {
    const modal = document.getElementById('calendario-modal');
    const titleEl = document.getElementById('cal-modal-squadra');
    const contentEl = document.getElementById('cal-modal-content');

    if (titleEl) titleEl.innerText = `Calendario - ${categoriaSquadra}`;
    if (contentEl) contentEl.innerHTML = '<p class="text-center text-gray-400 py-6">Caricamento calendario in corso...</p>';
    if (modal) modal.classList.remove('hidden');

    try {
        const matchFiles = await loadPartiteFiles();
        const partite = [];

        for (const file of matchFiles) {
            try {
                const match = await loadJsonOrFrontmatter(file);
                const matchCategory = (match.categoria || match.squadra || '').trim().toLowerCase();
                const targetCategory = categoriaSquadra.trim().toLowerCase();

                if (matchCategory === targetCategory || matchCategory === '') {
                    const { formattedDate, formattedTime, timestamp } = parseMatchDate(match);

                    let risultatoStr = '- : -';
                    if (match.stato === 'Conclusa' || (match.golCasa !== undefined && match.golOspite !== undefined && match.golCasa !== '' && match.golOspite !== '')) {
                        risultatoStr = `${match.golCasa} - ${match.golOspite}`;
                    } else if (match.stato) {
                        risultatoStr = match.stato;
                    }

                    let luogoFinale = match.indirizzoTrasferta || match.luogo || '';

                    partite.push({
                        casa: match.squadraCasa || 'Squadra Casa',
                        ospiti: match.squadraOspite || 'Squadra Ospite',
                        risultato: risultatoStr,
                        luogo: luogoFinale,
                        note: match.note || '',
                        timestamp: timestamp,
                        dateFormatted: formattedDate,
                        timeFormatted: formattedTime
                    });
                }
            } catch (fileErr) {
                console.warn(`Errore durante la lettura del file ${file.name}:`, fileErr);
            }
        }

        partite.sort((a, b) => a.timestamp - b.timestamp);

        if (partite.length === 0) {
            if (contentEl) {
                contentEl.innerHTML = `
                  <div class="text-center py-8 text-gray-500">
                    <i class="fa-regular fa-calendar-xmark text-4xl mb-2 text-gray-300"></i>
                    <p>Nessuna partita trovata per la categoria <strong>${categoriaSquadra}</strong>.</p>
                  </div>`;
            }
            return;
        }

        if (contentEl) {
            contentEl.innerHTML = partite.map(p => `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-brandRed transition">
                  <div class="flex justify-between items-center text-xs text-gray-500 mb-2 border-b border-gray-200 pb-1">
                    <span class="font-bold text-brandRed">Partita</span>
                    <span class="font-medium text-gray-700">
                      <i class="fa-regular fa-calendar mr-1 text-brandRed"></i>${p.dateFormatted || 'Data n.d.'} 
                      ${p.timeFormatted ? `<i class="fa-regular fa-clock ml-2 mr-1 text-brandRed"></i>${p.timeFormatted}` : ''}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between text-sm md:text-base font-bold text-gray-800 my-1">
                    <span class="w-2/5 text-right font-semibold ${p.casa.toLowerCase().includes('lodi') ? 'text-brandRed' : ''}">${p.casa}</span>
                    <span class="px-2.5 py-1 bg-brandDark text-white text-xs rounded font-mono shadow-sm">${p.risultato}</span>
                    <span class="w-2/5 text-left font-semibold ${p.ospiti.toLowerCase().includes('lodi') ? 'text-brandRed' : ''}">${p.ospiti}</span>
                  </div>

                  ${p.luogo ? `<div class="text-[11px] text-gray-500 text-center mt-2"><i class="fa-solid fa-location-dot mr-1 text-brandRed"></i>${p.luogo}</div>` : ''}
                  ${p.note ? `<div class="text-[10px] text-gray-400 italic text-center mt-0.5">Marcatori: ${p.note}</div>` : ''}
                </div>
              `).join('');
        }

    } catch (err) {
        console.error('ERRORE CALENDARIO:', err);
        if (contentEl) {
            contentEl.innerHTML = '<p class="text-center text-red-500 py-6">Impossibile caricare il calendario.</p>';
        }
    }
}

function closeCalendarioModal() {
    document.getElementById('calendario-modal')?.classList.add('hidden');
}

async function renderMatchCenter() {
    const container = document.getElementById('tab-matches-view');
    if (!container) return;

    try {
        const matchFiles = await loadPartiteFiles();
        const partitePrimaSquadra = [];
        const classificaMap = {};

        for (const file of matchFiles) {
            try {
                const match = await loadJsonOrFrontmatter(file);
                const cat = (match.categoria || match.squadra || '').trim().toLowerCase();
                if (cat === 'prima squadra' || cat === '1° squadra' || cat === '1 squadra') {
                    const { formattedDate, formattedTime, timestamp } = parseMatchDate(match);

                    const casa = match.squadraCasa || 'Nuova Lodi';
                    const ospite = match.squadraOspite || 'Avversario';
                    const gCasa = match.golCasa !== undefined && match.golCasa !== '' ? parseInt(match.golCasa, 10) : null;
                    const gOspite = match.golOspite !== undefined && match.golOspite !== '' ? parseInt(match.golOspite, 10) : null;

                    aggiornaClassifica(classificaMap, casa, ospite, gCasa, gOspite);

                    partitePrimaSquadra.push({
                        squadraCasa: casa,
                        squadraOspite: ospite,
                        golCasa: gCasa,
                        golOspite: gOspite,
                        stato: match.stato || '',
                        luogo: match.indirizzoTrasferta || match.luogo || 'C.S. Selvagreca',
                        timestamp: timestamp,
                        dateFormatted: formattedDate,
                        timeFormatted: formattedTime
                    });
                }
            } catch (fileErr) {
                console.warn('Errore lettura file partita:', fileErr);
            }
        }

        renderClassifica(classificaMap);

        container.innerHTML = '';

        if (partitePrimaSquadra.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-gray-500 text-sm py-4">Nessun match della Prima Squadra reperibile.</div>`;
            return;
        }

        partitePrimaSquadra.sort((a, b) => a.timestamp - b.timestamp);

        const oraAttuale = Date.now();
        let ultimaPartita = null;
        let prossimaPartita = null;

        for (let match of partitePrimaSquadra) {
            if (match.timestamp > 0 && match.timestamp <= oraAttuale) {
                ultimaPartita = match;
            } else if (!prossimaPartita && match.timestamp > oraAttuale) {
                prossimaPartita = match;
            }
        }

        if (!ultimaPartita && !prossimaPartita && partitePrimaSquadra.length > 0) {
            ultimaPartita = partitePrimaSquadra[partitePrimaSquadra.length - 1];
        }

        let htmlContent = '';

        if (ultimaPartita) {
            const haRisultato = ultimaPartita.golCasa !== null && ultimaPartita.golOspite !== null;
            const risultatoTesto = haRisultato ? `${ultimaPartita.golCasa} - ${ultimaPartita.golOspite}` : (ultimaPartita.stato || 'FINALE');

            htmlContent += `
            <div class="flex flex-col justify-between pt-2 md:pt-0 md:pr-4">
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider"><i class="fa-solid fa-clock-rotate-left text-brandDark mr-1"></i> Ultimo Turno</span>
                        <span class="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">${ultimaPartita.dateFormatted}</span>
                    </div>
                    <div class="flex items-center justify-between my-3">
                        <div class="w-2/5 text-right font-bold text-gray-800 text-sm md:text-base">${ultimaPartita.squadraCasa}</div>
                        <div class="w-1/5 text-center bg-gray-900 text-white font-black text-sm md:text-base py-1 px-2 rounded mx-2 shadow-inner">
                            ${risultatoTesto}
                        </div>
                        <div class="w-2/5 text-left font-bold text-gray-800 text-sm md:text-base">${ultimaPartita.squadraOspite}</div>
                    </div>
                </div>
                <div class="text-center mt-2">
                    <p class="text-xs text-gray-500 truncate"><i class="fa-solid fa-location-dot text-brandRed mr-1"></i> ${ultimaPartita.luogo}</p>
                </div>
            </div>`;
        }

        if (prossimaPartita) {
            htmlContent += `
            <div class="flex flex-col justify-between pt-4 md:pt-0 md:pl-4">
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-brandRed uppercase tracking-wider"><i class="fa-solid fa-calendar-day mr-1"></i> Prossimo Match</span>
                        <span class="text-xs font-semibold text-brandRed bg-red-50 px-2 py-0.5 rounded">
                            ${prossimaPartita.dateFormatted} ${prossimaPartita.timeFormatted ? '— Ore ' + prossimaPartita.timeFormatted : ''}
                        </span>
                    </div>
                    <div class="flex items-center justify-between my-3">
                        <div class="w-2/5 text-right font-bold text-gray-800 text-sm md:text-base">${prossimaPartita.squadraCasa}</div>
                        <div class="w-1/5 text-center text-brandRed font-black text-base md:text-lg mx-2">
                            VS
                        </div>
                        <div class="w-2/5 text-left font-bold text-gray-800 text-sm md:text-base">${prossimaPartita.squadraOspite}</div>
                    </div>
                </div>
                <div class="text-center mt-2">
                    <p class="text-xs text-gray-500 truncate"><i class="fa-solid fa-location-dot text-brandRed mr-1"></i> ${prossimaPartita.luogo}</p>
                </div>
            </div>`;
        }

        container.innerHTML = htmlContent;

    } catch (err) {
        console.error('Errore caricamento Match Center:', err);
        container.innerHTML = `<div class="col-span-full text-center text-red-500 text-xs py-4">Impossibile caricare i dati del Match Center.</div>`;
    }
}

function initPartite() {
    return renderMatchCenter();
}

window.openCalendarioModal = openCalendarioModal;
window.closeCalendarioModal = closeCalendarioModal;
window.renderMatchCenter = renderMatchCenter;



/* js/models/person.js */
class Person {
    constructor(data = {}) {
        Object.assign(this, data);
    }
}



/* js/modules/rose.js */

let globalRoseData = [];
let categoriaSelezionataDaEsterno = null;

const ROLE_ORDER = [
    'PORTIERE',
    'DIFENSORE',
    'CENTROCAMPISTA',
    'ATTACCANTE',
    'ALLENATORE',
    'VICE ALLENATORE',
    'DIRIGENTE'
];

function normalizeRole(role) {
    const normalized = (role || 'Giocatore')
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');

    if (normalized === 'VIDE ALLENATORE') {
        return 'VICE ALLENATORE';
    }

    return normalized;
}

function compareRoles(a, b) {
    const indexA = ROLE_ORDER.indexOf(normalizeRole(a));
    const indexB = ROLE_ORDER.indexOf(normalizeRole(b));

    if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
    }

    if (indexA !== -1) {
        return -1;
    }

    if (indexB !== -1) {
        return 1;
    }

    return normalizeRole(a).localeCompare(normalizeRole(b), 'it');
}

function displayRole(role) {
    const normalized = normalizeRole(role);
    const canonical = ROLE_ORDER.find(item => item === normalized);

    if (canonical) {
        return canonical
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    return role || 'Giocatore';
}

async function initPageRosa() {
    const pageContainer = document.getElementById('page-rosa');
    if (!pageContainer) return;

    try {
        const files = await listFolder(CONFIG.content.rose);
        const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));

        const parsedPromises = mdFiles.map(async file => new Person(await loadJsonOrFrontmatter(file)));
        const results = await Promise.all(parsedPromises);

        globalRoseData = results.filter(item => item && (item.nome || item.name) && item.categoria);

        if (globalRoseData.length === 0) {
            pageContainer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-12 text-center">
                <button onclick="showPage('squadre')" class="text-brandRed hover:underline text-xs font-bold uppercase mb-4 inline-flex items-center">
                    <i class="fa-solid fa-arrow-left mr-1"></i> Torna all'elenco squadre
                </button>
                <p class="text-gray-500 py-8">Nessun componente della rosa trovato su GitHub.</p>
            </div>`;
            return;
        }

        renderPageRosaLayout(pageContainer);

    } catch (error) {
        console.error('Errore nel caricamento della pagina Rosa:', error);
        pageContainer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-12 text-center">
                <button onclick="showPage('squadre')" class="text-brandRed hover:underline text-xs font-bold uppercase mb-4 inline-flex items-center">
                    <i class="fa-solid fa-arrow-left mr-1"></i> Torna all'elenco squadre
                </button>
                <p class="text-red-500 py-8">Si è verificato un errore durante il caricamento dei dati delle rose.</p>
            </div>`;
    }
}

function renderPageRosaLayout(container) {
    const categorieUniche = [...new Set(globalRoseData.map(item => item.categoria))];

    let categoriaIniziale = categoriaSelezionataDaEsterno;

    if (!categoriaIniziale || !categorieUniche.includes(categoriaIniziale)) {
        categoriaIniziale = categorieUniche.includes('Prima Squadra') ? 'Prima Squadra' : categorieUniche[0];
    }

    let html = `
        <section class="bg-brandDark text-white py-10 px-4 border-b-4 border-brandRed">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <button onclick="showPage('squadre')" class="text-brandYellow hover:underline text-xs font-bold uppercase mb-2 inline-flex items-center cursor-pointer">
                        <i class="fa-solid fa-arrow-left mr-1"></i> Torna all'elenco squadre
                    </button>
                    <h1 class="text-3xl md:text-4xl font-black uppercase tracking-tight">Rosa e Staff Tecnico</h1>
                    <p class="text-gray-300 text-xs mt-1">Stagione Sportiva 2026/2027</p>
                </div>
            </div>
        </section>

        <div class="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div class="flex flex-wrap justify-center gap-2 mb-8" id="rosa-filter-buttons">
      `;

    categorieUniche.forEach(cat => {
        const isActive = cat === categoriaIniziale;
        html += `
          <button 
            onclick="switchRosaCategoria('${cat}')" 
            data-cat="${cat}"
            class="rosa-btn-filter px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive 
                ? 'bg-brandRed text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }">
            ${cat}
          </button>
        `;
    });

    html += `
            </div>
            <div id="rosa-grid-container" class="space-y-8"></div>
        </div>
      `;

    container.innerHTML = html;
    renderRosaGrid(categoriaIniziale);
}

function switchRosaCategoria(categoria) {
    categoriaSelezionataDaEsterno = categoria;

    document.querySelectorAll('.rosa-btn-filter').forEach(btn => {
        if (btn.getAttribute('data-cat') === categoria) {
            btn.className = 'rosa-btn-filter px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 bg-brandRed text-white shadow-md cursor-pointer';
        } else {
            btn.className = 'rosa-btn-filter px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer';
        }
    });

    renderRosaGrid(categoria);
}

function renderRosaGrid(categoria) {
    const gridContainer = document.getElementById('rosa-grid-container');
    if (!gridContainer) return;

    const filtrati = globalRoseData.filter(item => item.categoria === categoria);

    if (filtrati.length === 0) {
        gridContainer.innerHTML = `<p class="text-center text-gray-500 py-8">Nessun atleta o staff trovato per la categoria <strong>${categoria}</strong>.</p>`;
        return;
    }

    const ruoli = [
        ...new Map(
            filtrati.map(item => [
                normalizeRole(item.ruolo || 'Giocatore'),
                displayRole(item.ruolo || 'Giocatore')
            ])
        ).values()
    ]
        .sort(compareRoles);
    let gridHtml = '';

    ruoli.forEach(ruolo => {
        const ruoloNormalizzato = normalizeRole(ruolo);
        const membriRuolo = filtrati.filter(item => normalizeRole(item.ruolo || 'Giocatore') === ruoloNormalizzato);

        gridHtml += `
          <section class="space-y-4">
            <h3 class="text-lg font-bold text-brandRed uppercase tracking-wider border-b-2 border-brandRed pb-1 inline-block">
              ${ruolo}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        `;

        membriRuolo.forEach(membro => {
            const nomeMembro = membro.nome || membro.name || 'Atleta';
            const foto = membro.foto || membro.image || '';

            gridHtml += `
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3">
              <div class="min-w-0 flex-1">
                <h4 class="font-bold text-brandDark text-sm truncate">${nomeMembro}</h4>
              </div>
            </div>
          `;
        });

        gridHtml += `
            </div>
          </section>
        `;
    });

    gridContainer.innerHTML = gridHtml;
}

function mostraRosaCategoria(categoria) {
    categoriaSelezionataDaEsterno = categoria;
    showPage('rosa');
    if (globalRoseData.length > 0) {
        switchRosaCategoria(categoria);
    }
}

function initRose() {
    return initPageRosa();
}

window.initPageRosa = initPageRosa;
window.switchRosaCategoria = switchRosaCategoria;
window.renderRosaGrid = renderRosaGrid;
window.mostraRosaCategoria = mostraRosaCategoria;



/* js/modules/documenti.js */

let documentiCaricati = false;

function apriModaleModulistica() {
    const modale = document.getElementById('modaleModulistica');
    if (modale) {
        if (modale.parentElement !== document.body) {
            document.body.appendChild(modale);
        }

        modale.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (!documentiCaricati) {
            caricaDocumentiModal();
        }
    }
}

function chiudiModaleModulistica() {
    const modale = document.getElementById('modaleModulistica');
    if (modale) {
        modale.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initDocumenti() {
    document.getElementById('modaleModulistica')?.addEventListener('click', function(e) {
        if (e.target === this) {
            chiudiModaleModulistica();
        }
    });
}

async function caricaDocumentiModal() {
    const container = document.getElementById('documentiContainerModal');
    if (!container) return;

    try {
        const files = await listFolder(CONFIG.content.documenti);
        const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));

        if (pdfFiles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fa-solid fa-file-pdf text-4xl text-gray-300 mb-2"></i>
                    <p class="text-sm font-medium">Al momento non ci sono file PDF disponibili.</p>
                </div>`;
            return;
        }

        let html = '';

        pdfFiles.forEach(file => {
            let nomePulito = file.name
                .replace(/\.pdf$/i, '')
                .replace(/[-_]/g, ' ');

            nomePulito = nomePulito.charAt(0).toUpperCase() + nomePulito.slice(1);

            const sizeKB = (file.size / 1024).toFixed(1);
            const sizeText = sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) + ' MB' : sizeKB + ' KB';

            html += `
            <div class="bg-gray-50 hover:bg-red-50/50 rounded-xl p-4 border border-gray-200 transition-colors flex items-center justify-between gap-3">
                <div class="flex items-center space-x-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-red-100 text-brandRed flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-file-pdf text-lg"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-bold text-gray-800 text-sm md:text-base truncate">${nomePulito}</h4>
                        <p class="text-xs text-gray-400">PDF &bull; ${sizeText}</p>
                    </div>
                </div>
                <a href="${file.download_url}" target="_blank" download class="shrink-0 bg-gray-900 hover:bg-brandRed text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-1.5">
                    <i class="fa-solid fa-download"></i>
                    <span>Scarica</span>
                </a>
            </div>`;
        });

        container.innerHTML = html;
        documentiCaricati = true;

    } catch (err) {
        console.error('Errore caricamento modulistica:', err);

        if (String(err.message).includes('404')) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fa-solid fa-folder-open text-4xl text-gray-300 mb-2"></i>
                    <p class="text-sm font-medium">Nessun documento trovato nella cartella <code>documenti/</code>.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="bg-red-50 text-red-600 p-4 rounded-xl text-center text-xs">
                Impossibile scaricare l'elenco dei documenti. Riprova più tardi.
            </div>`;
    }
}

window.apriModaleModulistica = apriModaleModulistica;
window.chiudiModaleModulistica = chiudiModaleModulistica;
window.caricaDocumentiModal = caricaDocumentiModal;


/* js/app.js */

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
