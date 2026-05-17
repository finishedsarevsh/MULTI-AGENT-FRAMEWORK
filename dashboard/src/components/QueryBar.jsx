import { forwardRef } from 'react'
import { Play, Loader, Paperclip, X, FileText } from 'lucide-react'

const QueryBar = forwardRef(function QueryBar(
  {
    transcript,
    setTranscript,
    contextFiles,
    onFileChange,
    onRemoveFile,
    fileInputRef,
    onRun,
    isDebating,
  },
  ref
) {
  const canSubmit = !isDebating && transcript.trim().length > 0

  const handleKeyDown = (e) => {
    // Cmd/Ctrl+Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      e.preventDefault()
      onRun()
    }
  }

  return (
    <div className="px-5 py-3 shrink-0">
      <div className="relative rounded-xl border border-gmad-border bg-gmad-card shadow-lg shadow-black/20 transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-blue-500/10">

        {/* ── File Chips Row (shown above textarea when files attached) ── */}
        {contextFiles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap px-4 pt-3 pb-0">
            {contextFiles.map((file, i) => (
              <span
                key={`${file.name}-${i}`}
                className="group inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-medium transition-colors hover:bg-blue-500/15"
              >
                <FileText size={12} className="shrink-0 opacity-70" />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(i)}
                  className="ml-0.5 p-0.5 rounded-md text-blue-300/60 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Textarea ── */}
        <textarea
          ref={ref}
          id="transcript-input"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your system requirements, paste a meeting transcript, or outline a feature spec…"
          rows={4}
          className="
            w-full bg-transparent text-[14px] leading-relaxed text-gmad-text
            placeholder:text-gmad-muted/40 outline-none resize-none
            px-4 pt-3 pb-2
          "
        />

        {/* ── Bottom Action Bar ── */}
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          {/* Left — Attach + Intent badge */}
          <div className="flex items-center gap-2">
            {/* Attach button */}
            <label
              htmlFor="file-upload-input"
              className="
                inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                text-gmad-muted text-[12px] cursor-pointer
                hover:bg-gmad-border/30 hover:text-blue-400
                transition-colors
              "
              title="Attach PDF context files"
            >
              <Paperclip size={14} />
              <span className="hidden sm:inline">Attach</span>
              <input
                ref={fileInputRef}
                id="file-upload-input"
                type="file"
                accept=".pdf"
                multiple
                onChange={onFileChange}
                className="hidden"
              />
            </label>

            {/* Intent badge */}
            <span className="px-2.5 py-1 rounded-md bg-gmad-citation-dim text-gmad-citation text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap">
              Intent: Technical
            </span>

            {/* Shortcut hint */}
            <span className="hidden md:inline text-[10px] text-gmad-muted/40 font-mono ml-1">
              Ctrl+Enter to run
            </span>
          </div>

          {/* Right — Run button */}
          <button
            type="button"
            onClick={onRun}
            disabled={!canSubmit}
            className="
              shrink-0 flex items-center gap-2 px-5 py-2
              bg-gradient-to-r from-blue-600 to-blue-500
              text-white text-[13px] font-semibold rounded-lg cursor-pointer
              whitespace-nowrap shadow-md shadow-blue-500/20
              hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30
              active:scale-[0.97]
              transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
            "
          >
            {isDebating ? (
              <>
                <Loader size={14} className="animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play size={14} strokeWidth={2.5} />
                Run Debate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

export default QueryBar
