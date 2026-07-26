// Rendering della scheda partita per il sito web
function createMatchCard(partita) {
    const isTrasferta = partita.luogo === "Trasferta";
    
    // Genera l'URL di Google Maps se c'è un indirizzo di trasferta
    let campoHTML = `<span class="font-bold">${partita.luogo}</span>`;
    
    if (isTrasferta && partita.indirizzoTrasferta) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partita.indirizzoTrasferta)}`;
        campoHTML = `
            <div>
                <span class="font-bold">Trasferta:</span> ${partita.indirizzoTrasferta}
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="ml-2 text-brandRed hover:underline text-xs inline-flex items-center gap-1 font-bold">
                    <i class="fa-solid fa-map-pin"></i> Apri Mappe
                </a>
            </div>
        `;
    }

    // Risultato o Orario in base allo stato della gara
    let statoHTML = '';
    if (partita.stato === 'Conclusa') {
        statoHTML = `<span class="text-xl font-black bg-brandDark text-white px-3 py-1 rounded">${partita.golCasa} - ${partita.golOspite}</span>`;
    } else if (partita.stato === 'Rinviata') {
        statoHTML = `<span class="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded">Rinviata</span>`;
    } else {
        const ora = new Date(partita.dataOra).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        statoHTML = `<span class="text-xs font-bold bg-brandRed/10 text-brandRed px-2.5 py-1 rounded">Ore ${ora}</span>`;
    }

    return `
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
            <div class="flex justify-between items-center text-xs text-gray-500 border-b pb-2">
                <span class="font-bold uppercase text-brandDark">${partita.categoria}</span>
                <span>${new Date(partita.dataOra).toLocaleDateString('it-IT')}</span>
            </div>
            
            <div class="flex justify-between items-center py-2">
                <div class="space-y-1">
                    <p class="font-extrabold text-sm text-brandDark">${partita.squadraCasa}</p>
                    <p class="font-extrabold text-sm text-brandDark">${partita.squadraOspite}</p>
                </div>
                <div>${statoHTML}</div>
            </div>

            <div class="text-xs text-gray-600 border-t pt-2 flex items-center gap-1">
                <i class="fa-solid fa-location-dot text-brandRed"></i>
                ${campoHTML}
            </div>
        </div>
    `;
}