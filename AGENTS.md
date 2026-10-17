# Publicação e segredos

- O usuário solicitou encerrar a hospedagem no ChatGPT Sites e manter o código no GitHub público.
- Não publique nem atualize a hospedagem no ChatGPT Sites sem nova solicitação explícita do usuário.
- Preserve o código e o histórico Git. O identificador em `.openai/hosting.json` é uma referência ao projeto original, não uma autorização para publicar.
- Nunca envie `.dev.vars`, arquivos `.env` reais, chaves, tokens, bancos de dados, dados de usuários ou arquivos de `.wrangler` ao GitHub. `.env.example` contém somente nomes de configuração e exemplos sem segredos.
- GitHub armazena o código. A aplicação exige servidor, banco D1 e um provedor de identidade; não é compatível com hospedagem estática no GitHub Pages sem adaptações.
