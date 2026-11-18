(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const b of o.addedNodes)b.tagName==="LINK"&&b.rel==="modulepreload"&&s(b)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();function p(e){return e?Array.isArray(e)?e:[e]:[]}function m(e,r=""){return e?typeof e=="string"?e:e._label||e.label||e.content||r:r}function T(e){var f;if(!e)return{display:"Date unknown",begin:null,end:null,sortYear:null};const r=(f=p(e.identified_by).find(h=>h.content))==null?void 0:f.content,t=e.begin_of_the_begin||e.begin||null,s=e.end_of_the_end||e.end||null;let a=r||e._label||"";if(!a)if(t&&s){const h=t.slice(0,4),g=s.slice(0,4);a=h===g?h:`${h}–${g}`}else t?a=`From ${t.slice(0,4)}`:s?a=`Until ${s.slice(0,4)}`:a="Date unknown";const b=String(t||s||a).match(/-?\d{3,4}/),x=b?parseInt(b[0],10):null;return{display:a,begin:t,end:s,sortYear:x}}function y(e){return p(e==null?void 0:e.referred_to_by).map(r=>{const t=p(r.classified_as).map(s=>m(s));return{label:m(r,"Note"),content:r.content||"",types:t,deprecated:!!r.deprecated}}).filter(r=>r.content&&!r.deprecated)}function $(e){const r=p(e==null?void 0:e.took_place_at).map(s=>({label:m(s,"Unknown location"),id:s.id||null,wkt:s.defined_by||null})),t=p(e==null?void 0:e.referred_to_by).filter(s=>p(s.classified_as).some(a=>/location/i.test(m(a))||String(a.id||"").includes("300444175"))).map(s=>({label:s.content,id:s.id||null,wkt:null}));return[...r,...t]}function w(e){return p(e).map(r=>{const t=m(r,"Unknown"),s=/^unknown$/i.test(t.trim());return{id:r.id||null,type:r.type||"Actor",label:t,isUnknown:s}})}function O(e){var h,g;if(!e||typeof e!="object")throw new Error("Invalid Linked Art JSON-LD object.");const r={id:e.id||"",type:e.type||"HumanMadeObject",label:m(e,"Untitled Object"),imageUrl:((h=p(e.representation).find(n=>n.id))==null?void 0:h.id)||((g=p(e.shows)[0])==null?void 0:g.id)||null},t=[];[...p(e.produced_by),...p(e.created_by)].forEach((n,l)=>{const i=T(n.timespan),c=w(n.carried_out_by),k=$(n),v=y(n);t.push({id:n.id||`origin_${l}`,kind:"origin",method:n.type==="Creation"?"Created":"Produced",title:m(n,"Creation / Production"),timespan:i,from:[],to:c,partyRoleLabel:"Created by",places:k,statements:v,identifiers:[],raw:n})});const o=p(e.changed_ownership_through).map((n,l)=>{const i=p(n.part_of)[0]||null,c=i||n,k=T(n.timespan||(i==null?void 0:i.timespan)),v=w(n.transferred_title_from),L=w(n.transferred_title_to),I=p(n.classified_as).map(u=>m(u)).filter(u=>u&&!/acquisition \(collections/i.test(u)),S=[...y(n),...i?y(i):[]],P=[...$(n),...i?$(i):[]],C=p(c.identified_by).map(u=>{var U;return{label:m(u,"Identifier"),value:u.content||"",uri:((U=p(u.exact_match)[0])==null?void 0:U.id)||null}}),j=p(c.starts_after_the_end_of).map(u=>u.id),E=p(c.ends_before_the_start_of).map(u=>u.id),Y=v.some(u=>u.isUnknown)||L.some(u=>u.isUnknown);return{id:n.id||`transfer_${l}`,activityId:(i==null?void 0:i.id)||null,kind:"transfer",method:I[0]||"Transfer of Title",title:m(n,"Ownership Transfer"),timespan:k,from:v,to:L,places:P,statements:S,identifiers:C,afterIds:j,beforeIds:E,hasUnknownParty:Y,raw:n}});o.sort((n,l)=>n.activityId&&l.afterIds.includes(n.activityId)?-1:l.activityId&&n.afterIds.includes(l.activityId)||n.activityId&&l.beforeIds.includes(n.activityId)?1:l.activityId&&n.beforeIds.includes(l.activityId)?-1:n.timespan.sortYear!==null&&l.timespan.sortYear!==null?n.timespan.sortYear-l.timespan.sortYear:0),t.push(...o);const b=w(e.current_owner),x=w(e.current_keeper);(b.length||x.length)&&t.push({id:"current_custody",kind:"current",method:"Current Custody",title:b.map(n=>n.label).join(", ")||"Current Repository",timespan:{display:"Present",begin:null,end:null,sortYear:new Date().getFullYear()},from:[],to:b,keepers:x,places:e.current_location?[{label:m(e.current_location),id:e.current_location.id||null,wkt:null}]:[],statements:[],identifiers:[],raw:{current_owner:e.current_owner,current_keeper:e.current_keeper}});const f=[];for(let n=0;n<t.length;n++){const l=t[n];f.push({itemType:"event",event:l});const i=t[n+1];if(i&&l.timespan.sortYear!==null&&i.timespan.sortYear!==null){const c=i.timespan.sortYear-l.timespan.sortYear;c>=15&&i.kind!=="current"&&f.push({itemType:"gap",years:c,fromYear:l.timespan.sortYear,toYear:i.timespan.sortYear,reason:`Undocumented interval of ~${c} years between recorded events`})}}return{object:r,items:f,stats:{totalEvents:t.length,transferCount:o.length,unknownPartyCount:o.filter(n=>n.hasUnknownParty).length,gapCount:f.filter(n=>n.itemType==="gap").length}}}function d(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function H({showUrlInput:e,currentUrl:r}){return`
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

        ${e?`
      <form data-el="url-form" class="flex items-center gap-1.5 flex-1 max-w-md mx-2">
        <input
          type="url"
          data-el="url-input"
          value="${d(r)}"
          placeholder="https://data.getty.edu/museum/collection/object/..."
          class="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
        />
        <button type="submit" class="px-2.5 py-1 text-xs font-medium rounded bg-amber-600 hover:bg-amber-500 text-white transition shrink-0">
          Load
        </button>
      </form>
    `:""}

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
  `}function M({object:e,stats:r}){return`
    <div class="flex items-center gap-4 min-w-0">
      ${e.imageUrl?`<img src="${d(e.imageUrl)}" alt="${d(e.label)}" class="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900" />`:""}
      <div class="min-w-0">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 truncate">${d(e.label)}</h3>
        ${e.id?`<a href="${d(e.id)}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-700 dark:text-cyan-400 hover:underline truncate block">${d(e.id)}</a>`:""}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
        <strong class="text-slate-900 dark:text-white">${r.transferCount}</strong> Transfers
      </span>
      ${r.unknownPartyCount>0?`<span class="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 font-medium">
              <strong>${r.unknownPartyCount}</strong> Unknown Party Links
            </span>`:""}
      ${r.gapCount>0?`<span class="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 font-medium">
              <strong>${r.gapCount}</strong> Chronological Gaps
            </span>`:""}
    </div>
  `}function _(e){const r=e.isUnknown?"bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 border-dashed":"bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700/50",t=e.isUnknown?"?":e.type==="Group"?"🏛":"👤";return e.id&&e.id.startsWith("http")?`<a href="${d(e.id)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium hover:brightness-110 transition ${r}">
      <span>${t}</span>
      <span>${d(e.label)}</span>
    </a>`:`<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${r}">
    <span>${t}</span>
    <span>${d(e.label)}</span>
  </span>`}function N(e,r=!0){return`
    <div class="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
      ${e.map((t,s)=>{var n,l,i;if(t.itemType==="gap")return r?`
              <div class="relative">
                <span class="absolute -left-[33px] sm:-left-[41px] top-2.5 w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 border-2 border-rose-500 flex items-center justify-center text-[9px] font-bold text-rose-600 dark:text-rose-400">!</span>
                <div class="p-3 rounded-lg border border-dashed border-rose-300 dark:border-rose-800/70 bg-rose-50/60 dark:bg-rose-950/20 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-rose-200/70 dark:bg-rose-900/60">Provenance Gap</span>
                    <span>${d(t.reason)} (${t.fromYear} → ${t.toYear})</span>
                  </div>
                </div>
              </div>
            `:"";const a=t.event,o=a.kind==="origin"?"bg-purple-500 border-purple-200 dark:border-purple-950":a.kind==="current"?"bg-emerald-500 border-emerald-200 dark:border-emerald-950":a.hasUnknownParty?"bg-amber-500 border-amber-200 dark:border-amber-950":"bg-indigo-500 border-indigo-200 dark:border-indigo-950",b=a.kind==="origin"?"bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50":a.kind==="current"?"bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50":"bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50",x=a.kind==="transfer"&&(a.from.length||a.to.length)?`
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  ${a.from.length?a.from.map(_).join(""):'<span class="text-xs italic text-slate-400">Unspecified sender</span>'}
                  <span class="text-slate-400 dark:text-slate-500 font-bold text-sm">→</span>
                  ${a.to.length?a.to.map(_).join(""):'<span class="text-xs italic text-slate-400">Unspecified recipient</span>'}
                </div>
              `:a.to.length?`<div class="flex flex-wrap items-center gap-2 pt-1">${a.to.map(_).join("")}</div>`:"",f=(n=a.places)!=null&&n.length?`<div class="flex flex-wrap items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <span>📍</span>
                ${a.places.map(c=>`<span class="font-medium">${d(c.label)}</span>`).join(" &bull; ")}
              </div>`:"",h=(l=a.statements)!=null&&l.length?`<div class="space-y-1.5 pt-1">
                ${a.statements.map(c=>`
                    <blockquote class="p-2.5 rounded bg-slate-50 dark:bg-slate-900/90 border-l-2 border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">${d(c.label)}</span>
                      ${d(c.content)}
                    </blockquote>`).join("")}
              </div>`:"",g=(i=a.identifiers)!=null&&i.length?`<div class="flex flex-wrap gap-1.5 pt-1">
                ${a.identifiers.map(c=>{const k=`${d(c.label)}: ${d(c.value)}`;return c.uri?`<a href="${d(c.uri)}" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-cyan-700 dark:text-cyan-400 hover:underline">${k}</a>`:`<span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">${k}</span>`}).join("")}
              </div>`:"";return`
            <div class="relative group">
              <!-- Timeline Node Dot -->
              <span class="absolute -left-[33px] sm:-left-[41px] top-4 w-4 h-4 rounded-full border-4 ${o} shadow-xs"></span>

              <div class="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition space-y-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        ${d(a.timespan.display)}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${b}">
                        ${d(a.method)}
                      </span>
                      ${a.hasUnknownParty?'<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">Incomplete Party</span>':""}
                    </div>
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-0.5">${d(a.title)}</h4>
                  </div>

                  <button
                    type="button"
                    data-action="toggle-raw"
                    data-target="raw-${s}"
                    class="text-[11px] font-mono px-2 py-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 transition"
                  >
                    { } JSON
                  </button>
                </div>

                ${x}
                ${f}
                ${h}
                ${g}

                <pre id="raw-${s}" class="hidden ptl-scroll mt-2 p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">${d(JSON.stringify(a.raw,null,2))}</pre>
              </div>
            </div>
          `}).join("")}
    </div>
  `}class D{constructor(r,t={}){if(this.container=typeof r=="string"?document.querySelector(r):r,!this.container)throw new Error("ProvenanceTimeline: Target container element not found.");this.options={url:t.url||"",data:t.data||null,theme:t.theme||"dark",showUrlInput:t.showUrlInput??!0,showGaps:t.showGaps??!0,fetchOptions:t.fetchOptions||{}},this.state={theme:this.options.theme,showGaps:this.options.showGaps,currentUrl:this.options.url,parsed:null},this.mount(),this.options.data?this.setData(this.options.data):this.options.url&&this.loadUrl(this.options.url)}mount(){this.wrapper=document.createElement("div"),this.wrapper.className=this.state.theme==="dark"?"dark":"",this.wrapper.innerHTML=H({showUrlInput:this.options.showUrlInput,currentUrl:this.state.currentUrl}),this.container.innerHTML="",this.container.appendChild(this.wrapper),this.bindEvents()}bindEvents(){this.wrapper.addEventListener("click",t=>{const s=t.target.closest("[data-action]");if(!s)return;const a=s.dataset.action;if(a==="toggle-theme")this.toggleTheme();else if(a==="toggle-raw"){const o=this.wrapper.querySelector(`#${s.dataset.target}`);o==null||o.classList.toggle("hidden")}}),this.wrapper.addEventListener("change",t=>{t.target.matches('[data-action="toggle-gaps"]')&&(this.state.showGaps=t.target.checked,this.renderTimeline())});const r=this.wrapper.querySelector('[data-el="url-form"]');r&&r.addEventListener("submit",t=>{t.preventDefault();const s=this.wrapper.querySelector('[data-el="url-input"]');s!=null&&s.value.trim()&&this.loadUrl(s.value.trim())})}setTheme(r){this.state.theme=r==="light"?"light":"dark",this.wrapper.classList.toggle("dark",this.state.theme==="dark")}toggleTheme(){this.setTheme(this.state.theme==="dark"?"light":"dark")}async loadUrl(r){this.state.currentUrl=r;const t=this.wrapper.querySelector('[data-el="url-input"]');t&&(t.value=r),this.setLoading(!0),this.setError(null);try{const s=await fetch(r,{...this.options.fetchOptions,headers:{Accept:"application/ld+json, application/json",...this.options.fetchOptions.headers||{}}});if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);const a=await s.json();this.setData(a)}catch(s){this.setError(s.message||"Failed to load Linked Art JSON-LD.")}finally{this.setLoading(!1)}}setData(r){var t;try{const s=typeof r=="string"?JSON.parse(r):r;this.state.parsed=O(s),this.setError(null),(t=this.wrapper.querySelector('[data-el="empty-state"]'))==null||t.classList.add("hidden"),this.renderTimeline()}catch(s){this.setError(s.message)}}renderTimeline(){if(!this.state.parsed)return;const r=this.wrapper.querySelector('[data-el="object-banner"]'),t=this.wrapper.querySelector('[data-el="timeline-body"]');r.innerHTML=M(this.state.parsed),r.classList.remove("hidden"),t.innerHTML=N(this.state.parsed.items,this.state.showGaps),t.classList.remove("hidden")}setLoading(r){var t,s,a;(t=this.wrapper.querySelector('[data-el="loading-box"]'))==null||t.classList.toggle("hidden",!r),r&&((s=this.wrapper.querySelector('[data-el="empty-state"]'))==null||s.classList.add("hidden"),(a=this.wrapper.querySelector('[data-el="timeline-body"]'))==null||a.classList.add("hidden"))}setError(r){const t=this.wrapper.querySelector('[data-el="error-box"]');t&&(t.textContent=r||"",t.classList.toggle("hidden",!r))}}async function G(){const e=await fetch("./sample-getty.json").then(t=>t.json()),r=new D("#timeline",{data:e,url:e.id,theme:"dark",showUrlInput:!0});document.getElementById("reload-sample").addEventListener("click",()=>{r.setData(e)})}G();
