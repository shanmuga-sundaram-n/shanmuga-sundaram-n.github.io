---
layout: page
title: Projects
description: Explore my portfolio of projects and technical work
permalink: /projects/
---

<!-- Open Source Projects -->
<section class="section-inner">
  <div class="section-header">
    <h2 class="section-title"><i class="fab fa-github"></i> Open Source Projects</h2>
    <p class="section-subtitle">Publicly available projects — contributions welcome</p>
  </div>

  {% assign oss_projects = site.data.projects | where: "opensource", true | sort: "date" | reverse %}
  <div class="grid grid-3">
    {% for project in oss_projects %}
    <div class="project-card">
      <div class="project-content">
        <span class="oss-badge"><i class="fas fa-code-branch"></i> Open Source</span>
        <h3 class="project-title">{{ project.title }}</h3>
        {% if project.date %}
        <p class="project-date"><i class="fas fa-calendar-alt"></i> {{ project.date | date: "%b %Y" }}</p>
        {% endif %}
        <p class="project-description">{{ project.description }}</p>
        <div class="tags">
          {% for tech in project.technologies %}
          <span class="tag">{{ tech }}</span>
          {% endfor %}
        </div>
        <div class="project-links">
          <a href="{{ project.github }}" class="btn btn-secondary" target="_blank" rel="noopener">
            <i class="fab fa-github"></i> View on GitHub
          </a>
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
    </div>
    {% endfor %}
  </div>
</section>

---

<div class="section-header" style="margin-top: var(--space-2xl);">
  <h2 class="section-title"><i class="fas fa-folder-open"></i> All Projects</h2>
  <p class="section-subtitle">A complete collection of my technical work</p>
</div>

<div class="grid grid-3">
  {% assign sorted_projects = site.data.projects | sort: "date" | reverse %}
  {% for project in sorted_projects %}
  <div class="project-card">
    <div class="project-content">
      <h3 class="project-title">{{ project.title }}</h3>
      {% if project.date %}
      <p class="project-date"><i class="fas fa-calendar-alt"></i> {{ project.date | date: "%b %Y" }}</p>
      {% endif %}
      <p class="project-description">{{ project.description }}</p>
      
      <div class="tags">
        {% for tech in project.technologies %}
        <span class="tag">{{ tech }}</span>
        {% endfor %}
      </div>
      
      <div class="project-links">
        {% if project.github %}
        <a href="{{ project.github }}" class="btn btn-secondary" target="_blank" rel="noopener">
          <i class="fab fa-github"></i> Code
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
  </div>
  {% endfor %}
</div>

---

<h2 class="section-title">More Projects Coming Soon!</h2>

I'm constantly working on new projects and experiments. Check back regularly or follow me on [GitHub](https://github.com/shanmuga-sundaram-n) to see what I'm building next.

<h3 class="card-title" style="text-align:center;">Want to Collaborate?</h3>

I'm always open to interesting project ideas and collaborations. If you have a project in mind or want to work together, feel free to [get in touch](/contact/)!
