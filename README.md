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
- **Checkout com Pix**: preencha `PIX` com a sua chave aleatória, o nome do titular e a cidade. Com a chave preenchida, o botão "Comprar agora" abre o checkout do próprio site (`#checkout`): o cliente preenche dados e endereço (o CEP completa o endereço sozinho), escolhe a entrega e recebe um Pix com QR code e copia e cola no valor exato do pedido. O Pix é gerado no navegador, sem intermediário e sem taxa. Cada pedido tem um código (ex.: `MB7KVZBJ`) que aparece no Pix, para você achar o pagamento no extrato. Os pedidos ficam guardados no Cloudflare e aparecem na página de pedidos (veja abaixo). Com o `WHATSAPP` preenchido, o botão "Já paguei" também abre a conversa com o pedido escrito, para o cliente mandar o comprovante. As opções de entrega ficam em `fretes`.
- **Pixel da Meta**: o ID fica em `PIXEL_META`. O site manda `PageView` ao abrir, `AddToCart` ao abrir o checkout com um kit (e ao trocar de kit), `AddPaymentInfo` ao chegar no pagamento e `Purchase` ao gerar o Pix, uma vez por pedido, com o código do pedido como `eventID`. Como a compra conta ao gerar o Pix, o Meta mostra mais compras que os Pix pagos de fato: os pagos de verdade ficam na página de pedidos. A página de pedidos não carrega o Pixel. Deixe `PIXEL_META` vazio para desligar.
- **Pixel da UTMify**: o ID fica em `PIXEL_UTMIFY` e o script carrega depois do Pixel da Meta, fora da página de pedidos. Ele marca visitas, rolagem (`ViewContent`) e cliques em "Comprar" (`InitiateCheckout`) e repassa para o pixel da Meta cadastrado na UTMify. Se esse for o mesmo pixel de `PIXEL_META`, confira no Gerenciador de Eventos se `PageView` ou `Purchase` aparecem em dobro. Deixe `PIXEL_UTMIFY` vazio para desligar.
- **Preços**: os valores em `kits` são exemplos. O preço por bombinha e a economia são calculados sozinhos.
- **Bichinhos**: confira a lista `bichinhos` com os brinquedos do lote que você vende.
- **Vídeos do produto**: ficam em `public/midia/` e estão ligados às seções em `videos` (topo, caixa, como funciona, benefícios e final). Para trocar um, substitua o `.mp4` e o pôster `.jpg` com o mesmo nome. Vídeos em MP4 (H.264), verticais e sem áudio funcionam melhor. Cada arquivo precisa ter menos de 25 MB (limite do Cloudflare). Para converter um vídeo do celular:

  ```
  ffmpeg -i original.mov -vf "scale=540:960:force_original_aspect_ratio=increase,crop=540:960" -c:v libx264 -profile:v high -crf 26 -pix_fmt yuv420p -an -movflags +faststart nome.mp4
  ```
- **Mais fotos e vídeos**: coloque os arquivos em `public/midia/` e liste em `midia`. Uma galeria extra aparece sozinha.
- **Depoimentos**: adicione avaliações reais de clientes em `depoimentos`. A seção só aparece quando houver alguma.

## Página de pedidos

Os pedidos do checkout ficam no banco D1 `mar-de-bolhas-pedidos` do Cloudflare (já ligado no `wrangler.jsonc`), e você acompanha tudo em `seusite.com/pedidos`: quem gerou o Pix, quem avisou que pagou, o que falta enviar, com endereço, CPF, botão para chamar o cliente no WhatsApp e o código de rastreio.

1. Crie a senha: no painel do Cloudflare, abra **Workers & Pages > mar-de-bolhas > Settings > Variables and Secrets > Add**, escolha o tipo **Secret**, nome `ADMIN_SENHA` e uma senha longa só sua. Depois clique em **Deploy**.
2. No iPhone, abra `seusite.com/pedidos` no Safari e entre com a senha.
3. Toque em **Compartilhar** (o quadrado com a seta) e depois em **Adicionar à Tela de Início**. A página vira um ícone e abre como um app, sem a barra do Safari. Na primeira vez que abrir pelo ícone, ele pede a senha de novo.

Cada pedido passa por: **Aguardando Pix** (gerou o Pix) → **Conferir Pix** (o cliente tocou em "Já paguei") → **Pago, falta enviar** (você tocou em "Pix recebido") → **Enviado**. A lista atualiza sozinha a cada minuto e sempre que você volta para o app. O botão **Baixar planilha** gera um CSV que abre no Excel ou no Numbers.

As prévias dos pull requests usam outro banco, `mar-de-bolhas-pedidos-preview` (bloco `previews` do `wrangler.jsonc`), para os testes nunca se misturarem com os pedidos de verdade. A página de pedidos da prévia só abre se você também cadastrar uma senha nela com `npx wrangler preview secret`.

Para testar no computador com o banco local: crie um arquivo `.dev.vars` com `ADMIN_SENHA=uma-senha`, rode `npx wrangler d1 migrations apply DB --local` uma vez e depois `npm run dev:worker`.

## UTMify

Cada pedido vai para a UTMify, que mostra quanto cada campanha, conjunto e anúncio vendeu. O site guarda os parâmetros `utm_*` do link do anúncio por 7 dias (`src/utms.js`) e manda junto com o pedido. O worker envia à UTMify (`worker/utmify.js`) quando o Pix é gerado (pendente), quando você marca **Pix recebido** (pago) e quando cancela (recusado, ou reembolsado se já estava pago).

1. Na UTMify, abra **Integrações > Webhooks > Credenciais de API**, crie uma credencial e copie o token.
2. No Cloudflare, cadastre o token como segredo, igual à senha da página de pedidos: **Workers & Pages > mar-de-bolhas > Settings > Variables and Secrets > Add**, tipo **Secret**, nome `UTMIFY_TOKEN`. Clique em **Deploy**.
3. Em cada anúncio da Meta, em **Parâmetros de URL**, cole:
   `utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}`

Sem o segredo, nada é enviado. Se a UTMify recusar um pedido, o motivo aparece nos logs do Worker no Cloudflare (**Observability**).

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
