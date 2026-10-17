# Conecta

Aplicação em português para compartilhar redes Wi-Fi. React, Vinext, Cloudflare Workers e D1. Autenticação administrada pelo Sites com ChatGPT; visitantes não precisam entrar para abrir `/r/<token>`.

## Segurança e dados

- Cada consulta administrativa usa o identificador do usuário autenticado; edições e exclusões exigem o mesmo proprietário.
- Tokens públicos aleatórios de 192 bits permanecem iguais após edições.
- Senhas criptografadas com AES-256-GCM e nonce individual. Configure `WIFI_ENCRYPTION_KEY` como segredo hexadecimal de 32 bytes. Preserve a chave: trocá-la sem migrar os dados impede descriptografar registros anteriores.
- Nenhum registro de senhas em logs. Respostas sem cache, política de referência restrita, noindex e robots.txt.
- A página pública revela intencionalmente as credenciais a quem possuir o link. Excluir uma rede revoga a página, mas não revoga um QR Code de conexão já impresso: altere as credenciais no roteador para isso.
- QR Codes usam `WIFI:T:...;S:...;P:...;H:...;;` e escapam barra invertida, ponto e vírgula, vírgula, aspas e dois-pontos. A conexão depende do dispositivo e da rede. WPA3 pessoal pode exigir configuração manual em aparelhos sem suporte ao formato.

## Desenvolvimento

Node 22.13 ou superior e pnpm 11.25.0. `pnpm install --frozen-lockfile`. Copie `.env.example` para `.dev.vars` e configure uma chave aleatória própria. Arquivos locais com segredos são ignorados pelo Git.

`pnpm build` gera o Worker. Aplique a migração local com:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_superb_harrier.sql
```

`pnpm dev` inicia em http://127.0.0.1:5173. O login local é simulado apenas em loopback pelo starter. Produção usa autenticação real do Sites.

## Verificação

- `node scripts/test-qr.mjs`: gera e decodifica quatro PNGs, incluindo caracteres especiais, rede oculta, WEP e rede aberta.
- Com o servidor local ativo: `node scripts/test-flow.mjs`. Usa dados fictícios e os remove ao terminar. Verifica autenticação, rejeição de cabeçalhos falsificados, CRUD, dados persistidos, criptografia no banco, isolamento entre usuários, página pública, link estável, CSRF, noindex e ausência de cache.
- `pnpm exec tsc --noEmit`: verificação de tipos.

Os testes não confirmam conexão física a um roteador. O layout foi inspecionado em desktop e celular de 390 px. Download utiliza PNG de 1200 px com margem de quatro módulos; impressão tem folha de estilo A5.

## Hospedagem e repositório

O usuário solicitou manter o código em um repositório GitHub público e encerrar a hospedagem no ChatGPT Sites. Não há autorização para novas publicações no Sites. A configuração `.openai/hosting.json` preserva a identificação do projeto original e a ligação D1 `DB` para referência.

GitHub armazena e versiona o código; isso não hospeda o backend automaticamente. Esta versão usa autenticação administrada pelo Sites e banco Cloudflare D1. Para executar em outro provedor, configure a infraestrutura e substitua a integração de identidade. GitHub Pages não executa este backend.

Banco de desenvolvimento e produção são independentes. Nenhuma senha, chave de criptografia ou banco deve ser enviado ao GitHub. Os dados de produção precisam ser migrados separadamente, preservando a chave de criptografia, antes de apagar a infraestrutura antiga se houver cadastros a manter.
