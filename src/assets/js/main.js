(() => {
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('.primary-nav');
  const toggleLabel = toggle?.querySelector('.nav-toggle-label');

  const closeNavigation = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
    if (toggleLabel) toggleLabel.textContent = 'Menu';
  };

  toggle?.addEventListener('click', () => {
    const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(willOpen));
    navigation?.classList.toggle('is-open', willOpen);
    if (toggleLabel) toggleLabel.textContent = willOpen ? 'Close' : 'Menu';
  });
  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    const search = filterBar.querySelector('[data-article-search]');
    const radios = [...filterBar.querySelectorAll('input[name="topic"]')];
    const articles = [...document.querySelectorAll('[data-article]')];
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    const initialTopic = params.get('topic') || 'All';
    search.value = initialQuery;
    const initialRadio = radios.find((radio) => radio.value === initialTopic);
    if (initialRadio) initialRadio.checked = true;

    const applyFilters = () => {
      const query = search.value.trim().toLowerCase();
      const topic = radios.find((radio) => radio.checked)?.value || 'All';
      let visible = 0;
      articles.forEach((article) => {
        const matchesQuery = !query || article.dataset.search.includes(query);
        const matchesTopic = topic === 'All' || article.dataset.category === topic;
        article.hidden = !(matchesQuery && matchesTopic);
        if (!article.hidden) visible += 1;
      });
      if (emptyState) emptyState.hidden = visible !== 0;
      const nextParams = new URLSearchParams();
      if (query) nextParams.set('q', search.value.trim());
      if (topic !== 'All') nextParams.set('topic', topic);
      const suffix = nextParams.toString() ? `?${nextParams}` : window.location.pathname;
      window.history.replaceState({}, '', suffix);
    };

    search.addEventListener('input', applyFilters);
    radios.forEach((radio) => radio.addEventListener('change', applyFilters));
    applyFilters();
  }

  const progress = document.querySelector('[data-reading-progress]');
  if (progress) {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const percent = available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0;
      progress.style.setProperty('--progress', `${percent}%`);
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  const copyButton = document.querySelector('[data-copy-link]');
  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyButton.textContent = 'Link copied';
    } catch {
      copyButton.textContent = 'Copy unavailable';
    }
  });

  const form = document.querySelector('[data-contact-form]');
  if (form && form.action && !form.querySelector('button[type="submit"]:disabled')) {
    form.addEventListener('submit', (event) => {
      let valid = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const error = form.querySelector(`[data-error-for="${field.name}"]`);
        if (!field.checkValidity()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (error) error.textContent = field.validationMessage;
        } else {
          field.removeAttribute('aria-invalid');
          if (error) error.textContent = '';
        }
      });
      if (!valid) {
        event.preventDefault();
        form.querySelector('[aria-invalid="true"]')?.focus();
      }
    });
  }
})();
