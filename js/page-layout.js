const PAGE_ROUTES = {
    home: 'pages/home.html',
    societa: 'pages/societa.html',
    squadre: 'pages/squadre.html',
    rosa: 'pages/rosa.html',
    iscrizioni: 'pages/iscrizioni.html',
    news: 'pages/news.html',
    sponsor: 'pages/sponsor.html',
    contatti: 'pages/contatti.html'
};

function pageLink(page) {
    return PAGE_ROUTES[page];
}

function navigationLink(page, label) {
    const active = document.body.dataset.page === page;
    return `<a href="${pageLink(page)}" class="${active ? 'text-brandYellow border-b-2 border-brandYellow' : 'hover:text-brandYellow'} transition pb-1">${label}</a>`;
}

function mobileNavigationLink(page, label) {
    const active = document.body.dataset.page === page;
    return `<a href="${pageLink(page)}" class="block ${active ? 'text-brandYellow' : 'hover:text-brandYellow'}">${label}</a>`;
}

function renderHeader() {
    return `
        <div class="bg-brandDark text-gray-300 text-xs py-2 px-4 border-b border-gray-700">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                <div class="flex items-center gap-4"></div>
                <div class="flex items-center gap-3">
                    <span><i class="fa-solid fa-envelope text-brandYellow mr-1"></i> info@nuovalodi.it</span>
                    <a href="#" class="hover:text-brandYellow"><i class="fa-brands fa-facebook-f"></i> Nuova Lodi ASD</a>
                    <a href="#" class="hover:text-brandYellow"><i class="fa-brands fa-instagram"></i> asd_nuovalodi</a>
                </div>
            </div>
        </div>
        <header class="bg-brandRed text-white shadow-lg sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <a href="${pageLink('home')}" class="flex items-center space-x-3">
                    <div class="w-14 h-14 bg-white rounded-full p-1 shadow flex items-center justify-center">
                        <img src="images/NLcircolare-PNG.png" alt="A.S.D. Nuova Lodi Logo" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <span class="block font-extrabold text-lg tracking-wider leading-none">NUOVA LODI</span>
                        <span class="text-xs text-brandYellow font-semibold tracking-widest">DAL 1952</span>
                    </div>
                </a>
                <nav class="hidden md:flex space-x-6 font-semibold text-sm">
                    ${navigationLink('home', 'HOME')}
                    ${navigationLink('societa', 'SOCIETÀ')}
                    ${navigationLink('squadre', 'SQUADRE')}
                    ${navigationLink('iscrizioni', 'SEGRETERIA')}
                    ${navigationLink('news', 'NEWS &amp; EVENTI')}
                    ${navigationLink('sponsor', 'SPONSOR')}
                    ${navigationLink('contatti', 'CONTATTI')}
                </nav>
                <button class="md:hidden text-white text-2xl focus:outline-none" type="button" onclick="toggleMenu()" aria-label="Apri il menu">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
            <div id="mobile-menu" class="hidden md:hidden bg-brandDark text-white px-4 py-3 space-y-2 border-t border-gray-700 font-semibold text-sm">
                ${mobileNavigationLink('home', 'HOME')}
                ${mobileNavigationLink('societa', 'SOCIETÀ')}
                ${mobileNavigationLink('squadre', 'SQUADRE')}
                ${mobileNavigationLink('iscrizioni', 'SEGRETERIA')}
                ${mobileNavigationLink('news', 'NEWS &amp; EVENTI')}
                ${mobileNavigationLink('sponsor', 'SPONSOR')}
                ${mobileNavigationLink('contatti', 'CONTATTI')}
            </div>
        </header>`;
}

function renderFooter() {
    return `
        <footer class="bg-brandDark text-white mt-auto border-t-4 border-brandRed">
            <div class="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div>
                    <h4 class="font-extrabold text-base mb-3 text-brandYellow">A.S.D. NUOVA LODI 1952</h4>
                    <p class="text-gray-400 text-xs leading-relaxed mb-3">Società sportiva dilettantistica affiliata alla F.I.G.C.</p>
                </div>
                <div></div>
                <div>
                    <h4 class="font-extrabold text-base mb-3 text-brandYellow">LINK UTILI</h4>
                    <a href="https://figc.it/it" class="text-xs text-gray-300 hover:text-brandYellow block">FIGC</a>
                    <a href="https://www.crlombardia.it/" class="text-xs text-gray-300 hover:text-brandYellow block">FIGC LND Lombardia</a>
                </div>
            </div>
            <div class="bg-black/40 py-4 text-center text-xs text-gray-500 border-t border-gray-800">© 2026 A.S.D. Nuova Lodi 1952. Tutti i diritti riservati.</div>
        </footer>`;
}

function renderModals() {
    return `
        <div id="news-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                <div class="bg-brandDark text-white p-5 sticky top-0 flex justify-between items-center border-b-4 border-brandRed">
                    <div><span id="modal-category" class="text-[10px] font-bold bg-brandRed text-white px-2 py-0.5 rounded uppercase">Categoria</span><span id="modal-date" class="text-xs text-gray-300 ml-2">Data</span></div>
                    <button type="button" onclick="closeNewsModal()" class="text-gray-300 hover:text-white text-xl" aria-label="Chiudi"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="p-6 space-y-4"><h2 id="modal-title" class="text-xl md:text-2xl font-black text-brandDark uppercase leading-snug">Titolo Notizia</h2><div id="modal-body" class="text-gray-700 text-sm leading-relaxed space-y-3 border-t pt-4"></div></div>
                <div class="p-4 bg-gray-50 border-t text-right"><button type="button" onclick="closeNewsModal()" class="bg-brandDark text-white hover:bg-brandRed text-xs font-bold px-4 py-2 rounded transition">Chiudi</button></div>
            </div>
        </div>
        <div id="calendario-modal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
                <div class="bg-brandDark text-white p-4 flex justify-between items-center border-b border-gray-700"><div><span class="text-xs uppercase font-semibold text-brandYellow">Stagione 2026/2027</span><h3 id="cal-modal-squadra" class="text-xl font-bold">Calendario Partite</h3></div><button type="button" onclick="closeCalendarioModal()" class="text-gray-400 hover:text-white text-2xl font-bold px-2" aria-label="Chiudi">&times;</button></div>
                <div class="p-4 md:p-6 overflow-y-auto flex-1 space-y-3" id="cal-modal-content"></div>
                <div class="p-3 bg-gray-50 border-t border-gray-100 text-right"><button type="button" onclick="closeCalendarioModal()" class="px-4 py-2 bg-gray-200 text-gray-700 font-semibold text-xs rounded hover:bg-gray-300 transition">Chiudi</button></div>
            </div>
        </div>`;
}

function renderDocumentModal() {
    return `
        <div id="modaleModulistica" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
                <div class="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shrink-0"><h3 class="font-black text-lg uppercase tracking-wide flex items-center gap-2"><i class="fa-solid fa-file-pdf text-brandRed"></i> Modulistica &amp; Documenti</h3><button type="button" onclick="chiudiModaleModulistica()" class="text-gray-400 hover:text-white transition-colors text-xl font-bold p-1" aria-label="Chiudi"><i class="fa-solid fa-xmark"></i></button></div>
                <div id="documentiContainerModal" class="p-6 overflow-y-auto space-y-4 flex-grow"><div class="text-center py-8 text-gray-400"><i class="fa-solid fa-circle-notch fa-spin text-2xl text-brandRed mb-2"></i><p class="text-sm">Caricamento documenti in corso...</p></div></div>
                <div class="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end shrink-0"><button type="button" onclick="chiudiModaleModulistica()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold py-2 px-4 rounded-lg transition">Chiudi</button></div>
            </div>
        </div>`;
}

function initPageLayout() {
    const main = document.querySelector('main');
    if (!main) return;

    main.classList.remove('hidden');
    document.body.insertAdjacentHTML('afterbegin', renderHeader());
    document.body.insertAdjacentHTML('beforeend', renderFooter());
    if (!document.getElementById('news-modal')) document.body.insertAdjacentHTML('beforeend', renderModals());
    if (!document.getElementById('modaleModulistica')) document.body.insertAdjacentHTML('beforeend', renderDocumentModal());
}

initPageLayout();
