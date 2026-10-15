# Mar de Bolhas

Landing page das bombinhas de banho com bichinho do mar surpresa (caixa com 12 bombas, temas A e B). Feita com Vite + React.

## Rodar no computador

Precisa do Node.js 22 (a versão está no arquivo `.nvmrc`). Na pasta do projeto:

```
npm install
npm run dev
```

`npm run build` gera a pasta `dist/`: o `index.html`, com o código e os estilos embutidos, e a pasta `midia/` com os vídeos. Para abrir ou mandar o site, use a pasta `dist/` inteira.

## Antes de publicar

Tudo que muda fica em `src/data.js`:

- **Link de compra** (quando o Pix não estiver configurado): preencha `LINK_LOJA` (checkout ou loja) ou `WHATSAPP` (só dígitos, com DDI e DDD, ex.: `5531999999999`). Com o WhatsApp, o botão abre a conversa com o kit e o preço já escritos. Se os dois ficarem vazios, os botões levam até a seção de kits.
- **Checkout com Pix**: preencha `PIX` com a sua chave aleatória, o nome do titular e a cidade. Com a chave preenchida, o botão "Comprar agora" abre o checkout do próprio site (`#checkout`): o cliente preenche dados e endereço (o CEP completa o endereço sozinho), escolhe a entrega e recebe um Pix com QR code e copia e cola no valor exato do pedido. O Pix é gerado no navegador, sem intermediário e sem taxa. Cada pedido tem um código (ex.: `MB7KVZBJ`) que aparece no Pix, para você achar o pagamento no extrato. Preencha também o `WHATSAPP`: é por ele que o pedido completo chega, quando o cliente toca em "Já paguei". As opções de entrega ficam em `fretes`.
- **Preços**: os valores em `kits` são exemplos. O preço por bombinha e a economia são calculados sozinhos.
- **Bichinhos**: confira a lista `bichinhos` com os brinquedos do lote que você vende.
- **Vídeos do produto**: ficam em `public/midia/` e estão ligados às seções em `videos` (topo, caixa, como funciona, benefícios e final). Para trocar um, substitua o `.mp4` e o pôster `.jpg` com o mesmo nome. Vídeos em MP4 (H.264), verticais e sem áudio funcionam melhor. Cada arquivo precisa ter menos de 25 MB (limite do Cloudflare). Para converter um vídeo do celular:

  ```
  ffmpeg -i original.mov -vf "scale=540:960:force_original_aspect_ratio=increase,crop=540:960" -c:v libx264 -profile:v high -crf 26 -pix_fmt yuv420p -an -movflags +faststart nome.mp4
  ```
- **Mais fotos e vídeos**: coloque os arquivos em `public/midia/` e liste em `midia`. Uma galeria extra aparece sozinha.
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
