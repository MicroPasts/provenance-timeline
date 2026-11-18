import './style.css';
import { parseLinkedArtProvenance } from './parser.js';
import { renderShell, renderObjectBanner, renderTimelineItems } from './template.js';

export class ProvenanceTimeline {
  constructor(target, options = {}) {
    this.container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.container) {
      throw new Error('ProvenanceTimeline: Target container element not found.');
    }

    this.options = {
      url: options.url || '',
      data: options.data || null,
      theme: options.theme || 'dark',
      showUrlInput: options.showUrlInput ?? true,
      showGaps: options.showGaps ?? true,
      fetchOptions: options.fetchOptions || {},
    };

    this.state = {
      theme: this.options.theme,
      showGaps: this.options.showGaps,
      currentUrl: this.options.url,
      parsed: null,
    };

    this.mount();

    if (this.options.data) {
      this.setData(this.options.data);
    } else if (this.options.url) {
      this.loadUrl(this.options.url);
    }
  }

  mount() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = this.state.theme === 'dark' ? 'dark' : '';
    this.wrapper.innerHTML = renderShell({
      showUrlInput: this.options.showUrlInput,
      currentUrl: this.state.currentUrl,
    });

    this.container.innerHTML = '';
    this.container.appendChild(this.wrapper);
    this.bindEvents();
  }

  bindEvents() {
    this.wrapper.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.dataset.action;
      if (action === 'toggle-theme') {
        this.toggleTheme();
      } else if (action === 'toggle-raw') {
        const pre = this.wrapper.querySelector(`#${actionEl.dataset.target}`);
        pre?.classList.toggle('hidden');
      }
    });

    this.wrapper.addEventListener('change', (e) => {
      if (e.target.matches('[data-action="toggle-gaps"]')) {
        this.state.showGaps = e.target.checked;
        this.renderTimeline();
      }
    });

    const form = this.wrapper.querySelector('[data-el="url-form"]');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.wrapper.querySelector('[data-el="url-input"]');
        if (input?.value.trim()) {
          this.loadUrl(input.value.trim());
        }
      });
    }
  }

  setTheme(theme) {
    this.state.theme = theme === 'light' ? 'light' : 'dark';
    this.wrapper.classList.toggle('dark', this.state.theme === 'dark');
  }

  toggleTheme() {
    this.setTheme(this.state.theme === 'dark' ? 'light' : 'dark');
  }

  async loadUrl(url) {
    this.state.currentUrl = url;
    const input = this.wrapper.querySelector('[data-el="url-input"]');
    if (input) input.value = url;

    this.setLoading(true);
    this.setError(null);

    try {
      const res = await fetch(url, {
        ...this.options.fetchOptions,
        headers: {
          Accept: 'application/ld+json, application/json',
          ...(this.options.fetchOptions.headers || {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      this.setData(json);
    } catch (err) {
      this.setError(err.message || 'Failed to load Linked Art JSON-LD.');
    } finally {
      this.setLoading(false);
    }
  }

  setData(jsonOrString) {
    try {
      const raw = typeof jsonOrString === 'string' ? JSON.parse(jsonOrString) : jsonOrString;
      this.state.parsed = parseLinkedArtProvenance(raw);
      this.setError(null);

      this.wrapper.querySelector('[data-el="empty-state"]')?.classList.add('hidden');
      this.renderTimeline();
    } catch (err) {
      this.setError(err.message);
    }
  }

  renderTimeline() {
    if (!this.state.parsed) return;

    const banner = this.wrapper.querySelector('[data-el="object-banner"]');
    const body = this.wrapper.querySelector('[data-el="timeline-body"]');

    banner.innerHTML = renderObjectBanner(this.state.parsed);
    banner.classList.remove('hidden');

    body.innerHTML = renderTimelineItems(this.state.parsed.items, this.state.showGaps);
    body.classList.remove('hidden');
  }

  setLoading(loading) {
    this.wrapper.querySelector('[data-el="loading-box"]')?.classList.toggle('hidden', !loading);
    if (loading) {
      this.wrapper.querySelector('[data-el="empty-state"]')?.classList.add('hidden');
      this.wrapper.querySelector('[data-el="timeline-body"]')?.classList.add('hidden');
    }
  }

  setError(message) {
    const box = this.wrapper.querySelector('[data-el="error-box"]');
    if (!box) return;
    box.textContent = message || '';
    box.classList.toggle('hidden', !message);
  }
}

export default ProvenanceTimeline;