<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Abhedya demonstration data in one client-side shared state module so role changes preserve the simulated decision flow without a backend.
- Use distinct TanStack routes for public introduction, demo login, and workspace; the workspace switches operational views locally to preserve context.
- Keep cinematic media controls and motion in dedicated client-safe components with reduced-motion support; this preserves server rendering and accessible navigation.
