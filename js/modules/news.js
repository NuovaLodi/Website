import { CONFIG } from '../config.js';
import { listFolder, loadJsonOrFrontmatter } from '../github.js';

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

export async function loadDynamicNews() {
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

export function openDynamicModal(index) {
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

export function initNews() {
    return loadDynamicNews();
}

window.loadDynamicNews = loadDynamicNews;
window.openDynamicModal = openDynamicModal;
