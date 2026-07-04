# Krishna Joshi — Portfolio

Personal portfolio of a London-based front-end developer (React specialist, 5+ years).

**Live site:** [krishnajoshi-code.github.io/portfolio](https://krishnajoshi-code.github.io/portfolio/)

## Highlights

- Interactive career timeline — expandable roles with tech stacks, live durations, and a scroll-drawn progress line
- Skill playgrounds — live mini demos (React counter, JS console, flexbox lab, Git terminal, and more)
- Project drawer with live site previews
- Hidden terminal easter egg (click the logo 5 times)
- Custom cursor, text scramble, and scroll-linked animations throughout

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router, static export)
- [React 18](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/) for all animations

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000/portfolio
```

## Deployment

Pushes to `main` are built and deployed to GitHub Pages automatically via GitHub Actions (`.github/workflows/deploy.yml`). The site is exported statically with `basePath: /portfolio`.
