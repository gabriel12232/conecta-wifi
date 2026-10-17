# Conecta Wi-Fi

Aplicação responsiva em português para cadastrar redes Wi-Fi e compartilhar uma página pública com senha e QR Code de conexão.

**Hospedagem atual do código:** Next.js 16 + React, preparado para Vercel, com Supabase para autenticação e PostgreSQL. O aplicativo não depende do login nem do banco do ChatGPT Sites.

**[Guia completo para Vercel e Supabase](VERCEL.md)** — criação do banco, variáveis de ambiente, confirmação de e-mail e configurações de build.

## Recursos

- Cadastro e login por e-mail e senha, com confirmação de e-mail pelo Supabase.
- Redes isoladas por usuário. Cada operação administrativa valida a sessão e o proprietário no servidor.
- Cadastro, edição, exclusão com confirmação, busca e filtros.
- Links públicos aleatórios de 192 bits que permanecem iguais após edições.
- Senhas Wi-Fi criptografadas com AES-256-GCM e nonce individual. Preserve `WIFI_ENCRYPTION_KEY`.
- QR Code no formato Wi-Fi padrão com escape de caracteres especiais, exportação PNG e impressão de cartão.
- Páginas sem indexação, sem cache e sem envio de referência a outros sites.

Qualquer pessoa com o link pode ver as credenciais compartilhadas. Se o nome ou a senha mudar, substitua o QR Code de conexão impresso. A leitura pode exigir confirmação no celular; a conexão e o acesso à internet dependem do aparelho e da rede.

## Desenvolvimento

Node >=22.13 e pnpm 11.25.0:

```
pnpm install --frozen-lockfile
```

Copie `.env.example` para `.env.local`, configure os valores do seu projeto Supabase e execute o SQL de `supabase/migrations/0001_networks.sql` no SQL Editor do Supabase. Não publique chaves ou bancos no GitHub.

```
pnpm dev
pnpm build
pnpm start
```

O build gera `.next/routes-manifest.json`, esperado pela Vercel. Mantenha o preset **Next.js** e a pasta de saída padrão. Não configure `dist`.

## Testes

- `node scripts/test-qr.mjs`: geração e decodificação de PNGs para WPA, WEP, rede aberta, rede oculta e credenciais com caracteres especiais.
- Com o servidor local ativo, `node scripts/test-flow.mjs`: teste HTTP de proteção administrativa, rejeição de cabeçalhos falsificados e origem inválida, página inicial, tela de login e link inválido.
- Sem um Supabase configurado, a integração de cadastro/login e persistência não pode ser testada de ponta a ponta. Siga a validação manual do guia após configurar seu projeto.

## Histórico de infraestrutura

Os arquivos antigos de Vinext, Drizzle SQLite e Cloudflare são referências históricas e não fazem parte do build Next.js atual. Não publique novamente no ChatGPT Sites sem nova autorização. A transferência do código não transfere cadastros antigos: qualquer migração do banco anterior exige mapear as novas contas e manter a chave de criptografia dos registros originais.
