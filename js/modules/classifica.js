function initTeam(classificaMap, nome) {
    if (!classificaMap[nome]) {
        classificaMap[nome] = { nome, giocati: 0, vinti: 0, pari: 0, persi: 0, punti: 0 };
    }
}

export function aggiornaClassifica(classificaMap, casa, ospite, gCasa, gOspite) {
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

export function renderClassifica(classificaMap) {
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

