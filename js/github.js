import { CONFIG } from './config.js';

const API_BASE = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repository}/contents`;
let manifestCache = null;

async function loadManifest() {
    if (manifestCache) {
        return manifestCache;
    }

    if (shouldUseEmbeddedContent() && window.NUOVA_LODI_CONTENT) {
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

function shouldUseEmbeddedContent() {
    return window.location.protocol === 'file:';
}

function shouldUseManifestFirst() {
    return true;
}

function addCacheBuster(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
}

export async function listFolder(path) {
    let manifest = null;

    if (shouldUseEmbeddedContent() || shouldUseManifestFirst()) {
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

export async function getTextFile(file, options = {}) {
    const allowEmbedded = options.allowEmbedded !== false;

    if (allowEmbedded && shouldUseEmbeddedContent() && typeof file.text === 'string') {
        return file.text;
    }

    const response = await fetch(addCacheBuster(file.download_url || file.path), {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Errore lettura file ${file.name}: ${response.status}`);
    }

    return response.text();
}

export function parseFrontmatter(text) {
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

export async function loadJsonOrFrontmatter(file) {
    const text = await getTextFile(file);

    if (file.name.endsWith('.json')) {
        return JSON.parse(text);
    }

    const parsed = parseFrontmatter(text);
    return { ...parsed.data, bodyContent: parsed.body };
}

export async function loadJsonOrFrontmatterFromSource(file) {
    const text = await getTextFile(file);

    if (file.name.endsWith('.json')) {
        return JSON.parse(text);
    }

    const parsed = parseFrontmatter(text);
    return { ...parsed.data, bodyContent: parsed.body };
}
