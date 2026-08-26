# frozen_string_literal: true

require 'json'

FOLDERS = %w[content/news content/partite content/rose documenti].freeze

content = FOLDERS.to_h do |folder|
  files = Dir.glob("#{folder}/**/*", File::FNM_DOTMATCH)
             .select { |path| File.file?(path) && File.basename(path) != '.DS_Store' }
             .sort_by(&:b)

  entries = files.map do |path|
    entry = {
      'name' => File.basename(path),
      'path' => path,
      'type' => 'file',
      'download_url' => path
    }
    entry['text'] = File.binread(path).force_encoding(Encoding::UTF_8) unless folder == 'documenti'
    entry
  end

  [folder, entries]
end

File.write('js/content-data.js', "window.NUOVA_LODI_CONTENT = #{JSON.pretty_generate(content)};\n")
