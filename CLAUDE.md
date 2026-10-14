# CLAUDE.md - Project Guide

## Project Overview
Personal portfolio website for **Shanmuga Sundaram Natarajan (Shan)** — a Hands-on Architect & Technical Leader with 19+ years of experience. The site is built with Jekyll and hosted on GitHub Pages at `shanmugasundaram.in`.

## Tech Stack
- **Static Site Generator**: Jekyll (via `github-pages` gem ~228)
- **Hosting**: GitHub Pages (branch: `gh-pages`)
- **Styling**: Custom CSS (no Sass preprocessing beyond Jekyll's front matter wrapper in `style.scss`)
- **Icons**: Font Awesome 6.4.0 (CDN)
- **Fonts**: Google Fonts — Inter, Space Grotesk, Open Sans, Raleway
- **Ruby version**: see `.ruby-version`

## Project Structure
```
_config.yml          # Jekyll config (site title, author, plugins, social links)
_layouts/
  default.html       # Base layout: header, nav, footer, theme-switcher script
  home.html          # Homepage: hero, about preview, skills grid, featured projects, blog posts
  page.html          # Generic page layout with hero banner
  post.html          # Blog post layout
_data/
  projects.yml       # Project data (title, description, image, technologies, links)
_posts/              # Blog posts (Markdown)
_plugins/
  reading_time.rb    # Custom Liquid filter for estimated reading time
assets/
  css/
    style.scss       # Main stylesheet (~985 lines) — CSS variables, components, responsive
    theme-switcher.css  # Theme & mode toggle styles, theme color/font variables
  js/
    theme-switcher.js   # Dark/light mode toggle
  images/            # Project screenshots, profile photo, logo
index.md             # Homepage (uses home layout)
about.md             # About page with professional experience, skills, education
projects.md          # Projects page (iterates _data/projects.yml)
contact.md           # Contact page
blog/index.md        # Blog listing
404.md               # Custom 404 page
CNAME                # Custom domain: shanmugasundaram.in
serve.py             # Python dev server for static preview (serves _site/)
```

## Key Architecture Decisions
- **No default theme** (`theme: null` in `_config.yml`) — all styling is custom CSS
- **CSS variables** for theming — colors, spacing, typography defined in `:root`
- **Single color theme**: `orange-red`, set via a fixed `data-theme="orange-red"` attribute on `<html>` (no theme picker UI)
- **Dark/light mode**: toggled via `data-mode` attribute on `<html>`, persisted in localStorage
- **Fixed header** with scroll effect and mobile hamburger menu
- **Glass-morphism cards** (`card-glass`) with backdrop-filter blur

## Development Workflow
1. **Recommended**: Edit locally, push to GitHub, GitHub Actions builds and deploys automatically
2. **Docker**: `docker run --rm -it --volume="$PWD:/srv/jekyll" --publish 4000:4000 jekyll/jekyll jekyll serve`
3. **Python server**: `bundle exec jekyll build && python3 serve.py` (static preview only on port 4000)

**Note**: `eventmachine` gem has compilation issues on macOS/Apple Silicon, so local `jekyll serve` may not work.

## Common Tasks
- **Add a project**: Edit `_data/projects.yml`, add image to `assets/images/projects/`
- **Add a blog post**: Create `_posts/YYYY-MM-DD-title.md` with front matter
- **Modify navigation**: Edit `_layouts/default.html` (nav-links section)
- **Change theme colors**: Edit `assets/css/theme-switcher.css` (`[data-theme="..."]` blocks)
- **Change base styles**: Edit `assets/css/style.scss`

## Style Conventions
- CSS uses BEM-like naming (`.project-card`, `.project-title`, `.project-content`)
- CSS variables follow `--color-*`, `--space-*`, `--font-size-*`, `--radius-*` naming
- Layouts use Liquid templating with Jekyll variables (`{% raw %}{{ site.* }}{% endraw %}`, `{% raw %}{{ page.* }}{% endraw %}`)
- Content pages use Markdown with YAML front matter (`layout`, `title`, `description`, `permalink`)
- HTML in content pages uses utility classes: `grid grid-2`, `card card-glass`, `text-center`, `mt-xl`
