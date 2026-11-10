export type Lang = 'pt' | 'en';

/** Portuguese for browsers set to any variant of Portuguese, English for everyone else. */
export function detectLang(languages: readonly string[]): Lang {
  const first = languages[0]?.toLowerCase() ?? '';
  return first === 'pt' || first.startsWith('pt-') ? 'pt' : 'en';
}

const pt = {
  utcTitle: 'Hora UTC',
  addPlaceholder: 'Link de um direto (YouTube, Twitch, Kick, Facebook, X)',
  addLabel: 'Link de um direto ou vídeo',
  add: 'Adicionar',
  layoutGroup: 'Disposição',
  layouts: {
    grid: { label: 'Grelha', hint: 'Todos os vídeos com o mesmo tamanho' },
    focus: { label: 'Destaque', hint: 'Um vídeo grande e os outros ao lado' },
    stage: { label: 'Palco', hint: 'Dois vídeos grandes em cima e os restantes em baixo' },
  },
  muteAll: 'Silenciar tudo',
  share: 'Copiar link para partilhar',
  clearAll: 'Remover todos',
  fullscreen: 'Ecrã inteiro',
  reportBug: 'Reportar um erro',
  emptyTitle: 'Nenhum direto no ecrã',
  emptyBody:
    'Cola acima o link de um direto ou vídeo do YouTube, Twitch, Kick, Facebook ou de um post do X. No YouTube funcionam links',
  emptyAnd: 'e',
  emptySaved:
    'Os vídeos ficam guardados neste browser e podes partilhar o ecrã inteiro com um link.',
  errorEmpty: 'Cola o link de um direto ou vídeo.',
  errorUnknown: 'Não reconheço esse link. Usa um link do YouTube, Twitch, Kick, Facebook ou X.',
  errorDuplicate: 'Esse vídeo já está no ecrã.',
  fbWatchHint: 'Abre o link fb.watch no browser e cola aqui o endereço completo do vídeo.',
  shareCopied: 'Link copiado. Quem o abrir vê estes vídeos.',
  sharePrompt: 'Copia este link:',
  clearConfirm: 'Remover todos os vídeos?',
  tileControls: 'Controlos do vídeo',
  dragHint: 'Arrastar para mudar de posição (ou usa as setas)',
  dragLabel: 'Mudar de posição',
  unmute: 'Ligar som',
  mute: 'Silenciar',
  solo: 'Ouvir só este',
  promote: 'Pôr em destaque',
  openIn: (platform: string) => `Abrir no ${platform}`,
  remove: 'Remover',
  postFailed: 'Não foi possível mostrar este post.',
  consentText: (provider: string) =>
    `Este vídeo é carregado a partir do ${provider}, que pode guardar cookies e recolher dados sobre ti (por exemplo, o endereço IP) segundo a`,
  consentPolicy: 'política de privacidade',
  consentPolicyEnd: 'dele.',
  consentLoad: (platform: string) => `Carregar vídeos do ${platform}`,
  consentNote: 'A escolha fica guardada neste browser. Podes retirá-la em Privacidade.',
  privacy: 'Privacidade',
  privacyStorage:
    'O Mission Control não tem contas, publicidade nem estatísticas de visitas, e não envia dados para nenhum servidor próprio. A lista de vídeos, a disposição e as plataformas que autorizaste ficam guardadas só neste browser.',
  privacyPlatforms:
    'Os vídeos são carregados a partir das plataformas (YouTube, Twitch, Kick, Facebook e X), que podem guardar cookies e recolher dados segundo as suas próprias políticas de privacidade. Por isso, cada plataforma só é carregada depois de a autorizares. O YouTube usa o modo de privacidade melhorada (youtube-nocookie.com).',
  privacyHosting:
    'O site está alojado no GitHub Pages, que regista o endereço IP dos visitantes por motivos de segurança. O botão de reportar um erro abre o GitHub com o browser e o link do ecrã já preenchidos.',
  privacyAllowed: 'Plataformas autorizadas:',
  privacyNone: 'nenhuma',
  privacyRevoke: 'Retirar autorizações',
  close: 'Fechar',
};

type Messages = typeof pt;

const en: Messages = {
  utcTitle: 'UTC time',
  addPlaceholder: 'Link to a live stream (YouTube, Twitch, Kick, Facebook, X)',
  addLabel: 'Link to a live stream or video',
  add: 'Add',
  layoutGroup: 'Layout',
  layouts: {
    grid: { label: 'Grid', hint: 'Every video the same size' },
    focus: { label: 'Focus', hint: 'One large video with the others beside it' },
    stage: { label: 'Stage', hint: 'Two large videos on top and the rest below' },
  },
  muteAll: 'Mute all',
  share: 'Copy share link',
  clearAll: 'Remove all',
  fullscreen: 'Full screen',
  reportBug: 'Report a bug',
  emptyTitle: 'No streams on screen',
  emptyBody:
    'Paste a link above to a live stream or video from YouTube, Twitch, Kick or Facebook, or to a post on X. On YouTube, these links work:',
  emptyAnd: 'and',
  emptySaved:
    'Your videos are saved in this browser, and you can share the whole screen with a link.',
  errorEmpty: 'Paste a link to a live stream or video.',
  errorUnknown: "That link isn't recognised. Use a link from YouTube, Twitch, Kick, Facebook or X.",
  errorDuplicate: 'That video is already on screen.',
  fbWatchHint: 'Open the fb.watch link in your browser and paste the full video address here.',
  shareCopied: 'Link copied. Anyone who opens it sees these videos.',
  sharePrompt: 'Copy this link:',
  clearConfirm: 'Remove all videos?',
  tileControls: 'Video controls',
  dragHint: 'Drag to change position (or use the arrow keys)',
  dragLabel: 'Change position',
  unmute: 'Unmute',
  mute: 'Mute',
  solo: 'Listen to this one only',
  promote: 'Make it the main video',
  openIn: (platform: string) => `Open on ${platform}`,
  remove: 'Remove',
  postFailed: "This post couldn't be shown.",
  consentText: (provider: string) =>
    `This video is loaded from ${provider}, which may set cookies and collect data about you (such as your IP address) under its`,
  consentPolicy: 'privacy policy',
  consentPolicyEnd: '',
  consentLoad: (platform: string) => `Load ${platform} videos`,
  consentNote: 'Your choice is saved in this browser. You can withdraw it under Privacy.',
  privacy: 'Privacy',
  privacyStorage:
    'Mission Control has no accounts, ads or visitor analytics, and sends no data to a server of its own. Your list of videos, the layout and the platforms you allowed are saved only in this browser.',
  privacyPlatforms:
    'The videos are loaded from the platforms (YouTube, Twitch, Kick, Facebook and X), which may set cookies and collect data under their own privacy policies. So each platform is only loaded after you allow it. YouTube uses privacy-enhanced mode (youtube-nocookie.com).',
  privacyHosting:
    "The site is hosted on GitHub Pages, which logs visitors' IP addresses for security. The report a bug button opens GitHub with your browser and the screen's link already filled in.",
  privacyAllowed: 'Allowed platforms:',
  privacyNone: 'none',
  privacyRevoke: 'Withdraw permissions',
  close: 'Close',
};

export const lang = detectLang(typeof navigator === 'undefined' ? [] : (navigator.languages ?? []));

/** Interface text in the visitor's language. */
export const t: Messages = lang === 'pt' ? pt : en;

/** Puts the page's own title and description in the visitor's language. */
export function applyDocumentLang(doc: Document) {
  doc.documentElement.lang = lang;
  if (lang === 'en') {
    doc.title = 'Mission Control · Watch multiple live streams in one grid';
    doc
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        'Watch several live streams at once in one grid: YouTube, Twitch, Kick, Facebook and X. Made for Starship launches, events and sports.',
      );
  }
}
