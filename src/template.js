export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderShell({ showUrlInput, currentUrl }) {
  const urlBar = showUrlInput
    ? `
      <form data-el="url-form" class="flex items-center gap-1.5 flex-1 max-w-md mx-2">
        <input
          type="url"
          data-el="url-input"
          value="${escapeHtml(currentUrl)}"
          placeholder="https://data.getty.edu/museum/collection/object/..."
          class="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
        />
        <button type="submit" class="px-2.5 py-1 text-xs font-medium rounded bg-amber-600 hover:bg-amber-500 text-white transition shrink-0">
          Load
        </button>
      </form>
    `
    : '';

  return `
    <div class="w-full rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
      <!-- Header -->
      <div class="shrink-0 flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Provenance Timeline
          </span>
        </div>

        ${urlBar}

        <div class="flex items-center gap-2">
          <label class="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <input type="checkbox" data-action="toggle-gaps" checked class="rounded text-amber-600 focus:ring-0" />
            <span>Highlight Gaps</span>
          </label>

          <button type="button" data-action="toggle-theme" title="Toggle Light/Dark Mode" class="p-1.5 rounded text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition">
            <svg class="w-4 h-4 hidden dark:block text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg class="w-4 h-4 block dark:hidden text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Object Summary Banner -->
      <div data-el="object-banner" class="hidden shrink-0 px-6 py-4 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"></div>

      <!-- Loading / Error / Empty -->
      <div data-el="loading-box" class="hidden p-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Resolving Linked Art provenance chain...
      </div>

      <div data-el="error-box" class="hidden m-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs"></div>

      <div data-el="empty-state" class="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Enter a Linked Art JSON-LD URL above or pass data via <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">setData()</code>.
      </div>

      <!-- Timeline Scroll Container -->
      <div data-el="timeline-body" class="hidden ptl-scroll overflow-y-auto p-6 sm:p-8 space-y-6"></div>
    </div>
  `;
}

export function renderObjectBanner({ object, stats }) {
  const imgHtml = object.imageUrl
    ? `<img src="${escapeHtml(object.imageUrl)}" alt="${escapeHtml(object.label)}" class="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900" />`
    : '';

  return `
    <div class="flex items-center gap-4 min-w-0">
      ${imgHtml}
      <div class="min-w-0">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 truncate">${escapeHtml(object.label)}</h3>
        ${
          object.id
            ? `<a href="${escapeHtml(object.id)}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-700 dark:text-cyan-400 hover:underline truncate block">${escapeHtml(object.id)}</a>`
            : ''
        }
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
        <strong class="text-slate-900 dark:text-white">${stats.transferCount}</strong> Transfers
      </span>
      ${
        stats.unknownPartyCount > 0
          ? `<span class="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 font-medium">
              <strong>${stats.unknownPartyCount}</strong> Unknown Party Links
            </span>`
          : ''
      }
      ${
        stats.gapCount > 0
          ? `<span class="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 font-medium">
              <strong>${stats.gapCount}</strong> Chronological Gaps
            </span>`
          : ''
      }
    </div>
  `;
}

function renderPartyBadge(party) {
  const baseClass = party.isUnknown
    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 border-dashed'
    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700/50';

  const icon = party.isUnknown ? '?' : party.type === 'Group' ? '🏛' : '👤';

  if (party.id && party.id.startsWith('http')) {
    return `<a href="${escapeHtml(party.id)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium hover:brightness-110 transition ${baseClass}">
      <span>${icon}</span>
      <span>${escapeHtml(party.label)}</span>
    </a>`;
  }

  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${baseClass}">
    <span>${icon}</span>
    <span>${escapeHtml(party.label)}</span>
  </span>`;
}

export function renderTimelineItems(items, showGaps = true) {
  return `
    <div class="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
      ${items
        .map((item, index) => {
          if (item.itemType === 'gap') {
            if (!showGaps) return '';
            return `
              <div class="relative">
                <span class="absolute -left-[33px] sm:-left-[41px] top-2.5 w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 border-2 border-rose-500 flex items-center justify-center text-[9px] font-bold text-rose-600 dark:text-rose-400">!</span>
                <div class="p-3 rounded-lg border border-dashed border-rose-300 dark:border-rose-800/70 bg-rose-50/60 dark:bg-rose-950/20 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-rose-200/70 dark:bg-rose-900/60">Provenance Gap</span>
                    <span>${escapeHtml(item.reason)} (${item.fromYear} → ${item.toYear})</span>
                  </div>
                </div>
              </div>
            `;
          }

          const ev = item.event;
          const dotColor =
            ev.kind === 'origin'
              ? 'bg-purple-500 border-purple-200 dark:border-purple-950'
              : ev.kind === 'current'
                ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-950'
                : ev.hasUnknownParty
                  ? 'bg-amber-500 border-amber-200 dark:border-amber-950'
                  : 'bg-indigo-500 border-indigo-200 dark:border-indigo-950';

          const badgeColor =
            ev.kind === 'origin'
              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50'
              : ev.kind === 'current'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50';

          const transferFlowHtml =
            ev.kind === 'transfer' && (ev.from.length || ev.to.length)
              ? `
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  ${ev.from.length ? ev.from.map(renderPartyBadge).join('') : '<span class="text-xs italic text-slate-400">Unspecified sender</span>'}
                  <span class="text-slate-400 dark:text-slate-500 font-bold text-sm">→</span>
                  ${ev.to.length ? ev.to.map(renderPartyBadge).join('') : '<span class="text-xs italic text-slate-400">Unspecified recipient</span>'}
                </div>
              `
              : ev.to.length
                ? `<div class="flex flex-wrap items-center gap-2 pt-1">${ev.to.map(renderPartyBadge).join('')}</div>`
                : '';

          const placesHtml = ev.places?.length
            ? `<div class="flex flex-wrap items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <span>📍</span>
                ${ev.places.map((p) => `<span class="font-medium">${escapeHtml(p.label)}</span>`).join(' &bull; ')}
              </div>`
            : '';

          const statementsHtml = ev.statements?.length
            ? `<div class="space-y-1.5 pt-1">
                ${ev.statements
                  .map(
                    (st) => `
                    <blockquote class="p-2.5 rounded bg-slate-50 dark:bg-slate-900/90 border-l-2 border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">${escapeHtml(st.label)}</span>
                      ${escapeHtml(st.content)}
                    </blockquote>`
                  )
                  .join('')}
              </div>`
            : '';

          const identifiersHtml = ev.identifiers?.length
            ? `<div class="flex flex-wrap gap-1.5 pt-1">
                ${ev.identifiers
                  .map((id) => {
                    const tag = `${escapeHtml(id.label)}: ${escapeHtml(id.value)}`;
                    return id.uri
                      ? `<a href="${escapeHtml(id.uri)}" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-cyan-700 dark:text-cyan-400 hover:underline">${tag}</a>`
                      : `<span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">${tag}</span>`;
                  })
                  .join('')}
              </div>`
            : '';

          return `
            <div class="relative group">
              <!-- Timeline Node Dot -->
              <span class="absolute -left-[33px] sm:-left-[41px] top-4 w-4 h-4 rounded-full border-4 ${dotColor} shadow-xs"></span>

              <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition space-y-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        ${escapeHtml(ev.timespan.display)}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}">
                        ${escapeHtml(ev.method)}
                      </span>
                      ${
                        ev.hasUnknownParty
                          ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">Incomplete Party</span>`
                          : ''
                      }
                    </div>
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-0.5">${escapeHtml(ev.title)}</h4>
                  </div>

                  <button
                    type="button"
                    data-action="toggle-raw"
                    data-target="raw-${index}"
                    class="text-[11px] font-mono px-2 py-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 transition"
                  >
                    { } JSON
                  </button>
                </div>

                ${transferFlowHtml}
                ${placesHtml}
                ${statementsHtml}
                ${identifiersHtml}

                <pre id="raw-${index}" class="hidden ptl-scroll mt-2 p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">${escapeHtml(JSON.stringify(ev.raw, null, 2))}</pre>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}