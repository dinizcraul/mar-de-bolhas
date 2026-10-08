# Mar de Bolhas

Landing page das bombinhas de banho com bichinho do mar surpresa (caixa com 12 bombas, temas A e B). Feita com Vite + React.

## Rodar no computador

Precisa do Node.js 22 (a versão está no arquivo `.nvmrc`). Na pasta do projeto:

```
npm install
npm run dev
```

`npm run build` gera `dist/index.html`, um arquivo único com tudo embutido.

## Antes de publicar

Tudo que muda fica em `src/data.js`:

- **Link de compra**: preencha `LINK_LOJA` (checkout ou loja) ou `WHATSAPP` (só dígitos, com DDI e DDD, ex.: `5531999999999`). Com o WhatsApp, o botão abre a conversa com o kit e o preço já escritos. Se os dois ficarem vazios, os botões levam até a seção de kits.
- **Preços**: os valores em `kits` são exemplos. O preço por bombinha e a economia são calculados sozinhos.
- **Bichinhos**: confira a lista `bichinhos` com os brinquedos do lote que você vende.
- **Fotos e vídeos reais**: coloque os arquivos em `public/midia/` e liste em `midia`. A galeria aparece sozinha.
- **Depoimentos**: adicione avaliações reais de clientes em `depoimentos`. A seção só aparece quando houver alguma.

## Publicar no Cloudflare

Cada `git push` na branch `main` publica a versão nova sozinho. Escolha uma das duas opções.

### Opção 1: Workers (a que o Cloudflare recomenda para projetos novos)

1. No painel do Cloudflare, abra **Workers & Pages** e clique em **Create application**.
2. Em **Import a repository**, clique em **Get started** e conecte sua conta do GitHub (autorize o app **Cloudflare Workers and Pages** só para este repositório).
3. Escolha o repositório `mar-de-bolhas` e preencha:
   - **Project name**: `mar-de-bolhas` (precisa ser igual ao `name` do `wrangler.jsonc`)
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
   - **Root directory**: deixe em branco
4. Clique em **Save and Deploy**. O site fica em `mar-de-bolhas.<sua-conta>.workers.dev`.

Domínio próprio: abra o Worker, vá em **Settings > Domains & Routes > Add > Custom Domain**. No Workers, o domínio precisa estar com o DNS no Cloudflare.

### Opção 2: Pages

1. No painel do Cloudflare, abra **Workers & Pages**, clique em **Create application**, aba **Pages**, e depois em **Import an existing Git repository**.
2. Escolha o repositório `mar-de-bolhas` e preencha:
   - **Framework preset**: `React (Vite)`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: deixe em branco
3. Clique em **Save and Deploy**. O site fica em `mar-de-bolhas.pages.dev`.

No Pages, dá para usar um domínio cujo DNS está fora do Cloudflare, com um registro CNAME apontando para `mar-de-bolhas.pages.dev`.

### Nas duas opções

- O Node usado no build vem do `.nvmrc` (22). Se precisar forçar, crie a variável `NODE_VERSION` = `22` nas configurações de build.
- O arquivo `public/_headers` vai junto para `dist/` e aplica cabeçalhos básicos de segurança.
- Se o projeto ficar numa subpasta de outro repositório, preencha **Root directory** com o nome dessa pasta.
