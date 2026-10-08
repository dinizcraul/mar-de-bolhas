// Todos os textos, preços e links da página ficam aqui.

export const marca = {
  nome: 'Mar de Bolhas',
  descricao: 'Bombinhas de banho com um bichinho do mar surpresa dentro',
}

// Para onde vão os botões de compra. Preencha pelo menos um:
// - LINK_LOJA: link do checkout ou da sua loja (ex.: 'https://sualoja.com.br/bombinhas')
// - WHATSAPP: número com DDI e DDD, só dígitos (ex.: '5531999999999')
// Se os dois ficarem vazios, os botões levam até a seção de kits.
export const LINK_LOJA = ''
export const WHATSAPP = ''

// Preços de exemplo: troque pelos seus antes de publicar
export const kits = [
  {
    id: 'uma',
    titulo: '1 caixa',
    bombas: 12,
    preco: 129.9,
    detalhe: 'Tema A ou Tema B',
    escolheTema: true,
  },
  {
    id: 'duas',
    titulo: '2 caixas',
    bombas: 24,
    preco: 229.9,
    detalhe: 'Tema A + Tema B',
    selo: 'Coleção completa',
  },
  {
    id: 'tres',
    titulo: '3 caixas',
    bombas: 36,
    preco: 319.9,
    detalhe: 'Para presentear mais de uma criança',
  },
]

export const temas = [
  { id: 'A', nome: 'Tema A', texto: 'Um conjunto de 12 bichinhos' },
  { id: 'B', nome: 'Tema B', texto: 'Outros 12 bichinhos' },
]

// Confira esta lista com os brinquedos do lote que você vende
export const bichinhos = [
  { id: 'polvo', nome: 'Polvo', artigo: 'um', curiosidade: 'Tem três corações e sangue azul.' },
  { id: 'tartaruga', nome: 'Tartaruga', artigo: 'uma', curiosidade: 'Volta para botar ovos na mesma praia onde nasceu.' },
  { id: 'tubarao', nome: 'Tubarão', artigo: 'um', curiosidade: 'Troca de dentes a vida inteira, um atrás do outro.' },
  { id: 'golfinho', nome: 'Golfinho', artigo: 'um', curiosidade: 'Dorme com metade do cérebro de cada vez.' },
  { id: 'baleia', nome: 'Baleia', artigo: 'uma', curiosidade: 'A baleia-azul é o maior animal que já existiu na Terra.' },
  { id: 'estrela', nome: 'Estrela-do-mar', artigo: 'uma', curiosidade: 'Se perde um braço, faz crescer outro no lugar.' },
  { id: 'cavalo', nome: 'Cavalo-marinho', artigo: 'um', curiosidade: 'Quem carrega os filhotes na barriga é o pai.' },
  { id: 'caranguejo', nome: 'Caranguejo', artigo: 'um', curiosidade: 'Anda de lado porque as patas dobram melhor para os lados.' },
  { id: 'palhaco', nome: 'Peixe-palhaço', artigo: 'um', curiosidade: 'Mora entre os tentáculos da anêmona, que o protege.' },
  { id: 'aguaviva', nome: 'Água-viva', artigo: 'uma', curiosidade: 'Não tem cérebro, nem coração, nem ossos.' },
  { id: 'arraia', nome: 'Arraia', artigo: 'uma', curiosidade: 'É prima do tubarão: o esqueleto das duas é de cartilagem.' },
  { id: 'baiacu', nome: 'Baiacu', artigo: 'um', curiosidade: 'Quando se assusta, enche o corpo de água e vira uma bola.' },
]

// Cores das bombinhas (iguais nos temas claro e escuro)
export const coresBomba = ['#FF8FB8', '#FFD45C', '#6EDCB9', '#A995FF', '#6EC6FF', '#FF9A73']

export const naCaixa = [
  { titulo: '12 bombas efervescentes', texto: 'Coloridas, para 12 banhos diferentes.' },
  { titulo: '12 bichinhos do mar', texto: 'Um brinquedinho escondido dentro de cada bomba.' },
  { titulo: 'Caixa de presente', texto: 'Chega pronta para entregar, sem precisar embrulhar.' },
  { titulo: 'Tema A ou Tema B', texto: 'Cada tema traz um conjunto próprio de bichinhos.' },
]

export const passos = [
  { titulo: 'Encha a banheira', texto: 'Água morna, na altura de sempre. Também funciona numa bacia ou banheira infantil.' },
  { titulo: 'Solte a bombinha', texto: 'Ela começa a efervescer assim que toca a água, soltando bolhas e cor.' },
  { titulo: 'Assista à efervescência', texto: 'Em poucos minutos a bomba se desfaz por completo e a água fica colorida.' },
  { titulo: 'Pegue o bichinho', texto: 'O brinquedo fica com a criança e entra para a coleção.' },
]

export const beneficios = [
  { icone: 'bath', titulo: 'O banho vira brincadeira', texto: 'A criança quer entrar na banheira para ver o que vai sair. Menos negociação na hora do banho.' },
  { icone: 'sparkles', titulo: 'Uma surpresa por banho', texto: 'São 12 bombinhas, então são 12 banhos com algo novo para descobrir.' },
  { icone: 'droplets', titulo: 'Cor, bolhas e espuma', texto: 'A água muda de cor enquanto a bomba efervesce. Dá para assistir do começo ao fim.' },
  { icone: 'shell', titulo: 'Um bichinho para guardar', texto: 'Depois do banho o brinquedo continua na brincadeira, e a coleção vai crescendo.' },
  { icone: 'leaf', titulo: 'Ingredientes naturais', texto: 'Fórmula efervescente feita com ingredientes naturais, pensada para o banho das crianças.' },
  { icone: 'gift', titulo: 'Pronto para presentear', texto: 'Vem em caixa de presente. Serve para aniversário, Natal ou lembrancinha de festa.' },
]

export const ocasioes = ['Dia das Crianças', 'Aniversário', 'Natal', 'Lembrancinha de festa', 'Dia de chuva']

export const cuidados = [
  'Indicado a partir de 3 anos. Contém peças pequenas.',
  'Use sempre com um adulto por perto durante o banho.',
  'Não é comestível: mantenha longe da boca.',
  'Evite contato com os olhos. Se acontecer, enxágue com bastante água.',
  'Se a criança tem pele sensível ou alergia, fale com o pediatra antes de usar.',
  'Guarde em lugar seco e fechado: a umidade ativa a efervescência.',
  'Enxágue a banheira logo depois do banho para não deixar resíduo de cor.',
]

export const perguntas = [
  {
    p: 'Quantas bombinhas vêm na caixa?',
    r: 'Cada caixa traz 12 bombas efervescentes, cada uma com um bichinho do mar diferente escondido dentro.',
  },
  {
    p: 'Qual a diferença entre o Tema A e o Tema B?',
    r: 'Cada tema vem com um conjunto próprio de 12 bichinhos. Quem quer a coleção completa pode levar as duas caixas no kit de 2.',
  },
  {
    p: 'A partir de que idade pode usar?',
    r: 'A partir de 3 anos, sempre com um adulto acompanhando o banho, porque os bichinhos são peças pequenas.',
  },
  {
    p: 'Mancha a banheira?',
    r: 'A cor se dissolve na água. Para não deixar resíduo, enxágue a banheira assim que o banho terminar.',
  },
  {
    p: 'Funciona sem banheira?',
    r: 'Sim. Uma bacia ou banheira infantil com água morna já basta para a bombinha efervescer e soltar o bichinho.',
  },
  {
    p: 'Como guardar as que sobrarem?',
    r: 'Na própria caixa, fechada, em lugar seco. Evite deixar no box do banheiro, onde o vapor pode ativar a bomba antes da hora.',
  },
  {
    p: 'Serve para criança com pele sensível?',
    r: 'A fórmula é feita com ingredientes naturais, mas cada pele reage de um jeito. Se a criança tem alergia ou pele sensível, consulte o pediatra antes.',
  },
]

// Depoimentos reais de clientes. A seção só aparece quando houver algum aqui.
// Formato: { nome: 'Ana', cidade: 'Belo Horizonte', texto: '...' }
export const depoimentos = []

// Fotos e vídeos reais do produto. Coloque os arquivos em public/midia/
// e liste aqui. A galeria só aparece quando houver algum item.
// Ex.: { tipo: 'foto', src: 'midia/caixa.jpg', alt: 'Caixa aberta com as 12 bombinhas' }
//      { tipo: 'video', src: 'midia/efervescendo.mp4', alt: 'Bombinha efervescendo na banheira' }
export const midia = []
