import { CONFIG } from '../config.js';
import { listFolder, loadJsonOrFrontmatter } from '../github.js';
import { Person } from '../models/person.js';
import { showPage } from './navigation.js';

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

export async function initPageRosa() {
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

export function renderPageRosaLayout(container) {
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

export function switchRosaCategoria(categoria) {
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

export function renderRosaGrid(categoria) {
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

export function mostraRosaCategoria(categoria) {
    categoriaSelezionataDaEsterno = categoria;
    showPage('rosa');
    if (globalRoseData.length > 0) {
        switchRosaCategoria(categoria);
    }
}

export function initRose() {
    return initPageRosa();
}

window.initPageRosa = initPageRosa;
window.switchRosaCategoria = switchRosaCategoria;
window.renderRosaGrid = renderRosaGrid;
window.mostraRosaCategoria = mostraRosaCategoria;
