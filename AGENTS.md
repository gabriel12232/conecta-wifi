# Publicação e segredos

- O usuário solicitou encerrar a hospedagem no ChatGPT Sites e manter o código no GitHub público.
- Não publique nem atualize a hospedagem no ChatGPT Sites sem nova solicitação explícita do usuário.
- Preserve o código e o histórico Git. O identificador em `.openai/hosting.json` é uma referência ao projeto original, não uma autorização para publicar.
- Nunca envie `.dev.vars`, arquivos `.env` reais, chaves, tokens, bancos de dados, dados de usuários ou arquivos de `.wrangler` ao GitHub. `.env.example` contém somente nomes de configuração e exemplos sem segredos.
- A versão atual usa Next.js na Vercel e Supabase para banco e autenticação. Não restaure o build Vinext, os bindings Cloudflare ou a autenticação por cabeçalhos do Sites nas rotas da aplicação. Os arquivos de configuração legados servem apenas de referência histórica.
- GitHub armazena o código. GitHub Pages não executa este backend.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
