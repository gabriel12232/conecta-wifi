# Hospedar o Conecta na Vercel

Esta versão usa Next.js padrão. O erro `routes-manifest.json` ocorria porque a Vercel esperava `.next`, enquanto o projeto anterior compilava com Vinext para Cloudflare Workers. O build agora é `next build --webpack`, usando o compilador Webpack suportado pelo Next.js.

## 1. Criar o Supabase

1. Crie uma conta e um projeto em https://supabase.com/dashboard . Guarde a senha do banco fora deste repositório.
2. No **SQL Editor**, execute o conteúdo de `supabase/migrations/0001_networks.sql` uma vez. A tabela guarda senhas Wi-Fi criptografadas. Acesso direto por visitantes e usuários é bloqueado; o servidor valida o proprietário antes de cada operação administrativa.
3. No diálogo **Connect** / configurações de API do projeto, obtenha o **Project URL** e a **Publishable key**. Em **API Keys**, obtenha também uma **Secret key** de servidor (ou a chave legada `service_role`). Não use a senha do banco no lugar dessas chaves.
4. Em **Authentication → URL Configuration**, configure **Site URL** com a URL de produção da Vercel. Adicione `https://SEU-DOMINIO/auth/confirm` às URLs de redirecionamento permitidas. Para desenvolvimento, adicione `http://localhost:3000/auth/confirm`.
5. Mantenha a confirmação de e-mail habilitada. Os envios de confirmação obedecem aos limites do Supabase; configure SMTP próprio se precisar de envio de produção em maior volume.

## 2. Configurar variáveis na Vercel

Em **Project → Settings → Environment Variables**, adicione:

| Nome | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto |
| `SUPABASE_SECRET_KEY` | Secret key do Supabase, somente no servidor |
| `WIFI_ENCRYPTION_KEY` | Chave aleatória de 32 bytes em hexadecimal (64 caracteres) |
| `NEXT_PUBLIC_SITE_URL` | URL de produção, por exemplo `https://conecta-wifi.vercel.app` |

Gere a chave de criptografia no seu terminal com:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Não publique o resultado no GitHub e não o envie pelo chat. Preserve essa chave: substituí-la sem migrar os registros impede ler as senhas antigas. Nunca dê prefixo `NEXT_PUBLIC_` à Secret key ou à chave de criptografia.

Se usar a chave legada `service_role`, ela também pode ser configurada como `SUPABASE_SERVICE_ROLE_KEY` em vez de `SUPABASE_SECRET_KEY`.

## 3. Configurar o build

- Framework Preset: **Next.js**.
- Root Directory: raiz do repositório (`./`).
- Build Command: **`pnpm build`** (ou o padrão definido no `vercel.json`).
- Output Directory: mantenha o padrão do Next.js, **sem override**. Não configure `dist`.
- Install Command: padrão; o projeto usa `pnpm-lock.yaml` e pnpm 11.25.0.
- Node.js: versão 24.x ou outra versão suportada pela Vercel que atenda a Node >=22.13.

Remova overrides antigos de build/output em **Settings → Build and Deployment** se ainda estiverem definidos. Faça um novo **Redeploy** após salvar as variáveis.

## 4. Validar sua instalação

Abra `/entrar`, crie sua conta, confirme o e-mail e entre. Cadastre uma rede de teste, abra o link público em uma janela anônima, edite a senha e confira a atualização no mesmo link. Baixe o PNG e valide a leitura no celular. Exclua a rede e confira que o link retorna página não encontrada.

O build pode passar antes de configurar o banco. Sem as variáveis, a tela de login informa a configuração pendente e as operações de banco permanecem indisponíveis. Compilar não substitui o teste completo com seu Supabase.

## Migração de dados antigos

O banco do ChatGPT Sites não é transferido automaticamente ao Supabase. Usuários têm novos identificadores; qualquer importação precisa associar os registros às novas contas e manter a chave original para descriptografar os dados antigos. O código da Vercel não confia nos cabeçalhos de autenticação do ChatGPT Sites.

## Estatísticas das redes

Execute também `supabase/migrations/0002_analytics.sql` no SQL Editor do Supabase e clique em Run. Essa migração cria a tabela de eventos e a função de agregação; não altera as redes existentes. Depois, acesse **Estatísticas** no menu do painel. Sem essa migração, o compartilhamento continua funcionando, mas a coleta e a consulta de estatísticas ficam indisponíveis.

Os eventos registram visualização, cópia de senha bem-sucedida, download concluído e abertura do diálogo de impressão. São deduplicados por rede, aba, tipo e dia UTC; visitas autenticadas do proprietário são ignoradas. O relatório mostra os últimos 7 ou 30 dias, começa após a ativação e não mede pessoas únicas, conexões ao roteador ou leitura de QR Code impresso. Apenas o proprietário autenticado consulta seus dados. Os eventos não incluem IP, e-mail ou credenciais Wi-Fi; são excluídos em cascata quando a rede é removida.
