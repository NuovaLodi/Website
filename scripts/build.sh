#!/bin/sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$PROJECT_ROOT"

bundle_tmp=$(mktemp "${TMPDIR:-/tmp}/nuova-lodi-bundle.XXXXXX")
manifest_tmp=$(mktemp "${TMPDIR:-/tmp}/nuova-lodi-manifest.XXXXXX")
trap 'rm -f "$bundle_tmp" "$manifest_tmp"' EXIT HUP INT TERM

{
    printf '%s\n\n' '/* Generated from js/modules. Run: sh scripts/build.sh */'
    first_source=true

    for source in \
        js/config.js \
        js/github.js \
        js/utils.js \
        js/modules/navigation.js \
        js/modules/classifica.js \
        js/modules/sponsor.js \
        js/modules/news.js \
        js/modules/partite.js \
        js/models/person.js \
        js/modules/rose.js \
        js/modules/documenti.js \
        js/app.js
    do
        if [ "$first_source" = false ]; then
            printf '\n'
        fi
        first_source=false
        printf '%s\n' "/* $source */"
        sed -e '/^import .* from .*;$/d' -e 's/^export //' "$source" | sed '${/^$/d;}'
    done
} > "$bundle_tmp"

json_escape() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/	/\\t/g'
}

write_folder() {
    folder=$1
    key=$2
    first_file=true

    printf '  "%s": [\n' "$key"
    find "$folder" -type f ! -name '.DS_Store' | LC_ALL=C sort | while IFS= read -r file
    do
        relative_path=${file#./}
        escaped_path=$(json_escape "$relative_path")

        if [ "$first_file" = true ]; then
            first_file=false
        else
            printf ',\n'
        fi

        printf '    {\n'
        printf '      "name": "%s",\n' "$(json_escape "${relative_path##*/}")"
        printf '      "path": "%s",\n' "$escaped_path"
        printf '      "type": "file",\n'
        printf '      "download_url": "%s"\n' "$escaped_path"
        printf '    }'
    done
    printf '\n  ]'
}

{
    printf '{\n'
    write_folder content/news content/news
    printf ',\n'
    write_folder content/partite content/partite
    printf ',\n'
    write_folder content/rose content/rose
    printf ',\n'
    write_folder documenti documenti
    printf '\n}\n'
} > "$manifest_tmp"

mv "$bundle_tmp" js/app.bundle.js
mv "$manifest_tmp" content/manifest.json
ruby scripts/generate-content-data.rb

printf '%s\n' 'Build completata: bundle, manifest e contenuti locali aggiornati.'
