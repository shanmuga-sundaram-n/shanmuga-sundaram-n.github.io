---
layout: page
title: Projects
description: Explore my portfolio of projects and technical work
permalink: /projects/
---

<div id="project-pagination-top" class="blog-pagination blog-pagination--top"></div>

<div class="writing-list project-list">
  {% assign sorted_projects = site.data.projects | sort: "date" | reverse %}
  {% for project in sorted_projects %}
  <article class="writing-item">
    <div>
      {% if project.opensource %}<span class="oss-chip"><i class="fas fa-code-branch"></i> Open Source</span>{% endif %}
      <h3 class="writing-item-title">{{ project.title }}</h3>
      <p class="project-description">{{ project.description }}</p>

      <div class="tags">
        {% for tech in project.technologies %}
        <span class="tag">{{ tech }}</span>
        {% endfor %}
      </div>

      <div class="project-links">
        {% if project.github %}
        <a href="{{ project.github }}" class="btn btn-secondary" target="_blank" rel="noopener">
          <i class="fab fa-github"></i> View on GitHub
        </a>
        {% endif %}
        {% if project.blog %}
        <a href="{{ project.blog | relative_url }}" class="btn btn-primary">
          <i class="fas fa-book-open"></i> Blog Post
        </a>
        {% endif %}
        {% if project.demo %}
        <a href="{{ project.demo }}" class="btn btn-outline" target="_blank" rel="noopener">
          <i class="fas fa-external-link-alt"></i> Demo
        </a>
        {% endif %}
      </div>
    </div>
  </article>
  {% endfor %}
</div>

<div id="project-pagination" class="blog-pagination"></div>

<script>
(function () {
  var PER_PAGE = 5;
  var items = Array.prototype.slice.call(document.querySelectorAll('.project-list .writing-item'));
  var controls = document.getElementById('project-pagination');
  var controlsTop = document.getElementById('project-pagination-top');
  if (!items.length || !controls || !controlsTop) return;

  var totalPages = Math.ceil(items.length / PER_PAGE);
  if (totalPages <= 1) return;

  var page = 1;

  function render() {
    items.forEach(function (el, i) {
      el.hidden = Math.floor(i / PER_PAGE) + 1 !== page;
    });

    var html = '<button class="pagination-btn" data-page="prev" aria-label="Previous page"' + (page === 1 ? ' disabled' : '') + '><i class="fas fa-chevron-left"></i> Previous</button>';
    for (var n = 1; n <= totalPages; n++) {
      html += '<button class="pagination-btn' + (n === page ? ' active' : '') + '" data-page="' + n + '"' + (n === page ? ' aria-current="page"' : '') + '>' + n + '</button>';
    }
    html += '<button class="pagination-btn" data-page="next" aria-label="Next page"' + (page === totalPages ? ' disabled' : '') + '>Next <i class="fas fa-chevron-right"></i></button>';
    controls.innerHTML = html;
    controlsTop.innerHTML = html;
  }

  function onClick(e) {
    var btn = e.target.closest('.pagination-btn');
    if (!btn || btn.disabled) return;
    var target = btn.dataset.page;
    if (target === 'prev') page = Math.max(1, page - 1);
    else if (target === 'next') page = Math.min(totalPages, page + 1);
    else page = parseInt(target, 10);
    render();
  }

  controls.addEventListener('click', onClick);
  controlsTop.addEventListener('click', onClick);

  render();
})();
</script>

<div class="projects-note">
  <p>I'm constantly working on new projects and experiments. Check back regularly or follow me on <a href="https://github.com/shanmuga-sundaram-n" target="_blank" rel="noopener">GitHub</a> to see what I'm building next.</p>
  <p>I'm always open to interesting project ideas and collaborations. If you have a project in mind or want to work together, feel free to <a href="{{ '/contact/' | relative_url }}">get in touch</a>!</p>
</div>
