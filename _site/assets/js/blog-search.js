(function () {
  const ALL_POSTS = JSON.parse(document.getElementById('post-data').textContent);
  const state = { query: '', category: 'all', month: 'all', page: 1, perPage: 6 };

  const postsContainer = document.getElementById('posts-container');
  const paginationControls = document.getElementById('pagination-controls');
  const paginationTop = document.getElementById('pagination-controls-top');
  const noResults = document.getElementById('no-results');
  const searchInput = document.getElementById('blog-search');
  const categoryFilters = document.getElementById('category-filters');
  const monthFilters = document.getElementById('month-filters');

  // Category filters are built from the posts themselves, so a new category appears
  // as soon as a post uses it. Most-used first; ties are alphabetical.
  var ACRONYMS = { ai: 'AI', ml: 'ML', rag: 'RAG', ddd: 'DDD', llm: 'LLM', api: 'API', aws: 'AWS', mcp: 'MCP', sdlc: 'SDLC', nlp: 'NLP' };
  var LABELS = { devops: 'DevOps' };

  function categoryLabel(key) {
    if (LABELS[key]) return LABELS[key];
    return key.split('-').map(function (w) {
      return ACRONYMS[w] || (w.charAt(0).toUpperCase() + w.slice(1));
    }).join(' ');
  }

  var CATEGORY_DEFS = (function () {
    var totals = {};
    ALL_POSTS.forEach(function (p) {
      (p.categories || []).forEach(function (c) {
        var k = c.toLowerCase();
        totals[k] = (totals[k] || 0) + 1;
      });
    });
    return Object.keys(totals)
      .sort(function (a, b) { return totals[b] - totals[a] || (a < b ? -1 : 1); })
      .map(function (k) { return { key: k, label: categoryLabel(k) }; });
  })();

  function renderCategoryFilters() {
    var inMonth = state.month === 'all' ? ALL_POSTS : ALL_POSTS.filter(function (p) { return p.month === state.month; });
    var counts = {};
    inMonth.forEach(function (p) {
      (p.categories || []).forEach(function (c) {
        var k = c.toLowerCase();
        counts[k] = (counts[k] || 0) + 1;
      });
    });

    if (state.category !== 'all' && !counts[state.category]) state.category = 'all';

    var html = '<button class="category-btn' + (state.category === 'all' ? ' active' : '') + '" data-category="all">All <span class="filter-count">' + inMonth.length + '</span></button>';
    CATEGORY_DEFS.forEach(function (c) {
      if (!counts[c.key]) return;
      html += '<button class="category-btn' + (state.category === c.key ? ' active' : '') + '" data-category="' + c.key + '">' +
        escapeHtml(c.label) + ' <span class="filter-count">' + counts[c.key] + '</span></button>';
    });
    categoryFilters.innerHTML = html;
  }

  function filterPosts() {
    let posts = ALL_POSTS;

    if (state.query) {
      const q = state.query.toLowerCase();
      posts = posts.filter(function (p) {
        const text = [p.title, p.excerpt, p.description, (p.tags || []).join(' '), (p.categories || []).join(' ')].join(' ').toLowerCase();
        return text.includes(q);
      });
    }

    if (state.category !== 'all') {
      posts = posts.filter(function (p) {
        return (p.categories || []).map(function (c) { return c.toLowerCase(); }).includes(state.category);
      });
    }

    if (state.month !== 'all') {
      posts = posts.filter(function (p) { return p.month === state.month; });
    }

    return posts;
  }

  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var expandedYears = null;

  function renderMonthFilters() {
    var years = {};
    ALL_POSTS.forEach(function (p) {
      var y = p.month.slice(0, 4);
      years[y] = years[y] || { count: 0, months: {} };
      years[y].count++;
      years[y].months[p.month] = (years[y].months[p.month] || 0) + 1;
    });
    var yearKeys = Object.keys(years).sort().reverse();

    if (expandedYears === null) {
      expandedYears = {};
      expandedYears[yearKeys[0]] = true;
    }
    if (state.month !== 'all') expandedYears[state.month.slice(0, 4)] = true;

    var html = '<button class="category-btn' + (state.month === 'all' ? ' active' : '') + '" data-month="all">All Months <span class="filter-count">' + ALL_POSTS.length + '</span></button>';

    yearKeys.forEach(function (y) {
      var open = !!expandedYears[y];
      html += '<div class="archive-year">' +
        '<button class="archive-year-toggle" data-year="' + y + '" aria-expanded="' + open + '">' +
        '<i class="fas fa-chevron-' + (open ? 'down' : 'right') + '"></i> ' + y +
        ' <span class="filter-count">' + years[y].count + '</span></button>';
      if (open) {
        html += '<div class="archive-months">';
        Object.keys(years[y].months).sort().reverse().forEach(function (m) {
          html += '<button class="category-btn' + (state.month === m ? ' active' : '') + '" data-month="' + m + '">' +
            MONTH_NAMES[parseInt(m.slice(5), 10) - 1] + ' <span class="filter-count">' + years[y].months[m] + '</span></button>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
    monthFilters.innerHTML = html;
  }

  function renderCards(posts) {
    if (posts.length === 0) {
      postsContainer.innerHTML = '';
      noResults.hidden = false;
      return;
    }

    noResults.hidden = true;
    postsContainer.innerHTML = posts.map(function (post) {
      let excerpt = post.description || post.excerpt || '';
      if (excerpt.length > 110) excerpt = excerpt.slice(0, 109).trim() + '\u2026';

      return '<article class="writing-item">' +
        '<div class="writing-item-meta">' +
        '<time datetime="' + escapeHtml(post.isoDate) + '">' + escapeHtml(post.dateShort) + '</time>' +
        (post.readTime ? '<span class="writing-item-readtime">' + post.readTime + ' min read</span>' : '') +
        '</div>' +
        '<div>' +
        '<h3 class="writing-item-title"><a href="' + post.url + '">' + escapeHtml(post.title) + '</a></h3>' +
        '<p>' + escapeHtml(excerpt) + '</p>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function renderPagination(total) {
    const totalPages = Math.ceil(total / state.perPage);

    if (totalPages <= 1) {
      paginationControls.innerHTML = '';
      paginationTop.innerHTML = '';
      return;
    }

    let html = '';
    html += '<button class="pagination-btn" data-page="prev" ' + (state.page === 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i> Previous</button>';

    for (let i = 1; i <= totalPages; i++) {
      html += '<button class="pagination-btn' + (i === state.page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }

    html += '<button class="pagination-btn" data-page="next" ' + (state.page === totalPages ? 'disabled' : '') + '>Next <i class="fas fa-chevron-right"></i></button>';

    paginationControls.innerHTML = html;
    paginationTop.innerHTML = html;
  }

  function render() {
    const filtered = filterPosts();
    const total = filtered.length;
    const start = (state.page - 1) * state.perPage;
    const paginated = filtered.slice(start, start + state.perPage);

    renderCards(paginated);
    renderPagination(total);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Search input with debounce
  var debounceTimer;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      state.query = searchInput.value.trim();
      state.page = 1;
      render();
    }, 200);
  });

  // Category filter buttons
  categoryFilters.addEventListener('click', function (e) {
    var btn = e.target.closest('.category-btn');
    if (!btn) return;

    state.category = btn.dataset.category;
    state.page = 1;
    renderCategoryFilters();
    render();
  });

  // Month filter buttons
  monthFilters.addEventListener('click', function (e) {
    var toggle = e.target.closest('.archive-year-toggle');
    if (toggle) {
      expandedYears[toggle.dataset.year] = !expandedYears[toggle.dataset.year];
      renderMonthFilters();
      return;
    }

    var btn = e.target.closest('.category-btn');
    if (!btn) return;

    state.month = btn.dataset.month;
    state.page = 1;
    renderMonthFilters();
    renderCategoryFilters();
    render();
  });

  // Pagination (event delegation)
  function onPaginationClick(e) {
    var btn = e.target.closest('.pagination-btn');
    if (!btn || btn.disabled) return;

    var page = btn.dataset.page;
    var totalPages = Math.ceil(filterPosts().length / state.perPage);

    if (page === 'prev') {
      state.page = Math.max(1, state.page - 1);
    } else if (page === 'next') {
      state.page = Math.min(totalPages, state.page + 1);
    } else {
      state.page = parseInt(page, 10);
    }

    render();
  }

  paginationControls.addEventListener('click', onPaginationClick);
  paginationTop.addEventListener('click', onPaginationClick);

  // Initial render
  renderMonthFilters();
  renderCategoryFilters();
  render();
})();
