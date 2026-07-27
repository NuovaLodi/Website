import { CONFIG } from '../config.js';
import { listFolder, loadJsonOrFrontmatter } from '../github.js';
import { aggiornaClassifica, renderClassifica } from './classifica.js';

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

export async function openCalendarioModal(categoriaSquadra) {
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

export function closeCalendarioModal() {
    document.getElementById('calendario-modal')?.classList.add('hidden');
}

export async function renderMatchCenter() {
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

export function initPartite() {
    return renderMatchCenter();
}

window.openCalendarioModal = openCalendarioModal;
window.closeCalendarioModal = closeCalendarioModal;
window.renderMatchCenter = renderMatchCenter;

