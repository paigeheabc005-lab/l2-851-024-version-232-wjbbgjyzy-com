(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!target || target.tagName !== 'IMG') {
      return;
    }

    const frame = target.closest('.poster-frame, .hero-slide, .detail-poster, .search-result-poster');
    if (frame) {
      frame.classList.add('image-fallback');
      if (!frame.getAttribute('data-fallback')) {
        frame.setAttribute('data-fallback', target.getAttribute('alt') || '高清电影');
      }
    }
    target.remove();
  }, true);

  function setupMobileMenu() {
    const button = $('[data-mobile-menu-button]');
    const panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '×' : '☰';
    });
  }

  function setupHeroCarousel() {
    const carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    const slides = $$('.hero-slide', carousel);
    const dots = $$('.hero-dot', carousel);
    if (slides.length <= 1) {
      return;
    }

    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-pressed', String(dotIndex === index));
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => show(dotIndex));
    });

    setInterval(() => show(index + 1), 5200);
  }

  function setupCardFilters() {
    const panel = $('[data-filter-panel]');
    const grid = $('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }

    const input = $('[data-filter-keyword]', panel);
    const typeSelect = $('[data-filter-type]', panel);
    const yearSelect = $('[data-filter-year]', panel);
    const cards = $$('.movie-card', grid);
    const noResults = $('[data-no-results]');

    const apply = () => {
      const keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' ').toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesType = !type || card.dataset.type === type;
        const matchesYear = !year || card.dataset.year === year;
        const show = matchesKeyword && matchesType && matchesYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, typeSelect, yearSelect].filter(Boolean).forEach((control) => {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function setupSearchPage() {
    const root = $('[data-search-page]');
    if (!root || !Array.isArray(window.MOVIES)) {
      return;
    }

    const input = $('[data-search-input]', root);
    const results = $('[data-search-results]', root);
    const count = $('[data-search-count]', root);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    const render = (query) => {
      const keyword = query.trim().toLowerCase();
      let list = window.MOVIES;
      if (keyword) {
        list = window.MOVIES.filter((movie) => {
          const text = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags,
            movie.oneLine
          ].join(' ').toLowerCase();
          return text.includes(keyword);
        });
      } else {
        list = window.MOVIES.slice(0, 60);
      }

      list = list.slice(0, 120);

      if (count) {
        count.textContent = keyword
          ? `找到 ${list.length} 条相关影片，最多显示前 120 条。`
          : '输入关键词可搜索全站 2000 部影片；下方先展示推荐片单。';
      }

      if (!results) {
        return;
      }

      if (!list.length) {
        results.innerHTML = '<div class="no-results is-visible">没有找到匹配影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = list.map((movie) => `
        <article class="search-result-item">
          <a class="search-result-poster" href="${escapeHtml(movie.url)}" data-fallback="${escapeHtml(movie.title)}">
            <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)} 海报" loading="lazy">
          </a>
          <div>
            <h2><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h2>
            <div class="movie-meta">
              <span>${escapeHtml(movie.year)}</span>
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml(movie.type)}</span>
              <span>${escapeHtml(movie.genre)}</span>
            </div>
            <p>${escapeHtml(movie.oneLine)}</p>
            <a class="btn-small" href="${escapeHtml(movie.url)}">进入详情</a>
          </div>
        </article>
      `).join('');
    };

    render(initialQuery);

    if (input) {
      input.addEventListener('input', () => render(input.value));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
  });
})();
