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

export function renderSponsors() {
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

export function initSponsors() {
    renderSponsors();
}
