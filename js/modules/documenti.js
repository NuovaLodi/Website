import { listFolder } from '../github.js';
import { CONFIG } from '../config.js';

let documentiCaricati = false;

export function apriModaleModulistica() {
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

export function chiudiModaleModulistica() {
    const modale = document.getElementById('modaleModulistica');
    if (modale) {
        modale.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

export function initDocumenti() {
    document.getElementById('modaleModulistica')?.addEventListener('click', function(e) {
        if (e.target === this) {
            chiudiModaleModulistica();
        }
    });
}

export async function caricaDocumentiModal() {
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
