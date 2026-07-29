export type VisualAsset = {
  id: string;
  name: string;
  path: string;
  alt: string;
  href?: string;
};

type AssetGroup = {
  type: 'board' | 'investment' | 'philanthropy' | 'hero';
  label: string;
  items: VisualAsset[];
};

const assetBase = '/assets/uploads';

const resolvePath = (file: string) =>
  file.startsWith('http') || file.startsWith('/') ? file : `${assetBase}/${file}`;

const formatAssetName = (alt: string) => {
  const trimmed = alt.trim();
  const cleaned = trimmed.replace(/\s+(logo|crest|lockup)\b.*$/i, '');
  return cleaned.length ? cleaned : trimmed;
};

const make = (
  id: string,
  file: string,
  alt: string,
  href?: string,
): VisualAsset => ({
  id,
  name: formatAssetName(alt),
  path: resolvePath(file),
  alt,
  href,
});

export const heroAssets: VisualAsset[] = [
  make('don-listwin', '2020/05/don-02.jpg', 'Portrait of Don Listwin'),
  make('clarius', '2020/05/clarius.png', 'Clarius Mobile Health logo', 'https://clarius.com/'),
  make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
  make('zevx', '2023/02/ZevX-logo-300x141.png', 'ZEVX logo'),
  make('carbon-robotics', '/assets/media/carbon-robotics-logo.webp', 'Carbon Robotics logo', 'https://carbonrobotics.com/'),
];

export const boardAssets: AssetGroup[] = [
  {
    type: 'board',
    label: 'Current Boards',
    items: [
      make('4ag', '/assets/media/4ag-robot.webp', '4AG autonomous mushroom harvester', '/4ag'),
      make('carbon-robotics', '/assets/media/carbon-robotics-logo.webp', 'Carbon Robotics logo', 'https://carbonrobotics.com/'),
      make('belizekids', '2018/05/belize.png', 'BelizeKids.org logo', 'https://belizekids.org/'),
      make('canary-foundation', '2018/05/cf.png', 'Canary Foundation logo', 'https://www.canaryfoundation.org/'),
    ],
  },
  {
    type: 'board',
    label: 'CEO Experience',
    items: [
      make('openwave', '2018/05/openwave.png', 'Openwave logo'),
      make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
      make('zevx', '2023/02/ZevX-logo-300x141.png', 'ZEVX logo'),
      make('sana', '2018/05/sana.png', 'Sana Security logo'),
      make('canary-foundation', '2018/05/cf.png', 'Canary Foundation logo', 'https://www.canaryfoundation.org/'),
      make('belizekids', '2018/05/belize.png', 'BelizeKids.org logo', 'https://belizekids.org/'),
    ],
  },
  {
    type: 'board',
    label: 'Notable Boards',
    items: [
      make('etek', '2018/05/etek.png', 'ETEK Dynamics logo'),
      make('redback', '2018/05/redback.png', 'Redback Networks logo'),
      make('isilon', '2018/05/isilon.png', 'Isilon Systems logo'),
    ],
  },
  {
    type: 'board',
    label: 'Previous Boards',
    items: [
      make('awarex', '2020/05/awarex.png', 'AwareX logo', 'https://www.awarex.com/'),
      make('calix', '2018/05/calix.png', 'Calix logo', 'https://www.calix.com/'),
      make('dwave', '2018/05/dwave.png', 'D-Wave Systems logo', 'https://www.dwavequantum.com/'),
      make('genologics', '2018/05/genologics.png', 'GenoLogics logo'),
      make('joyent', '2018/05/joyent.png', 'Joyent logo'),
      make('plumgrid', '2018/05/plumgrid.png', 'PLUMgrid logo'),
      make('poet', '2020/05/poet-02.png', 'POET Technologies logo', 'https://poet-technologies.com/'),
      make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
      make('robin', '2020/05/robin-02.png', 'Robin Systems logo', 'https://global.rakuten.com/corp/news/press/2022/0228_03.html'),
      make('teradici', '2018/05/teradici.png', 'Teradici logo', 'https://www.hp.com/us-en/newsroom/press-releases/2021/hp-inc-completes-acquisition-of-teradici.html'),
      make('openwave', '2018/05/openwave.png', 'Openwave logo'),
    ],
  },
];

export const investmentAssets: AssetGroup[] = [
  {
    type: 'investment',
    label: 'Seed',
    items: [
      make('vida', '2022/05/vida.png', 'VIDA lung health', 'https://www.vidalung.ai/'),
    ],
  },
  {
    type: 'investment',
    label: 'Private',
    items: [
      make('awarex', '2020/05/awarex.png', 'AwareX logo', 'https://www.awarex.com/'),
      make('clarius', '2020/05/clarius-02.png', 'Clarius Mobile Health logo', 'https://clarius.com/'),
      make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
      make('zededa', '2020/05/zededa.png', 'Zededa', 'https://zededa.com/'),
    ],
  },
  {
    type: 'investment',
    label: 'Venture',
    items: [
      make('hwvp', '/assets/media/hwvp-logo.svg', 'HWVP logo', 'https://hwvp.com/'),
      make('rally', '2018/05/rally.png', 'Rally Ventures logo', 'https://rallyventures.com/'),
      make('sequoia', '/assets/media/sequoia-logo.png', 'Sequoia Capital logo', 'https://www.sequoiacap.com/'),
      make('telesoft', '/assets/media/telesoft-logo.png', 'TeleSoft Partners logo', 'https://www.telesoft.ai/'),
    ],
  },
  {
    type: 'investment',
    label: 'Public',
    items: [
      make('calix', '2018/05/calix.png', 'Calix logo', 'https://www.calix.com/'),
    ],
  },
  {
    type: 'investment',
    label: 'Philanthropic',
    items: [
      make('belizekids', '2018/05/belize.png', 'BelizeKids.org', 'https://belizekids.org/'),
      make('canary-foundation', '2018/05/cf.png', 'Canary Foundation', 'https://www.canaryfoundation.org/'),
    ],
  },
  {
    type: 'investment',
    label: 'Exits',
    items: [
      make('uberflip', '2018/05/uberflip.png', 'Uberflip'),
      make('openwave', '2018/05/openwave.png', 'Openwave logo'),
      make('genologics', '2018/05/genologics.png', 'GenoLogics logo'),
      make('joyent', '2018/05/joyent.png', 'Joyent logo'),
      make('isilon', '2018/05/isilon.png', 'Isilon Systems logo'),
      make('plumgrid', '2018/05/plumgrid.png', 'PLUMgrid logo'),
      make('teradici', '2018/05/teradici.png', 'Teradici logo'),
      make('zevx', '2023/02/ZevX-logo-300x141.png', 'ZEVX logo'),
    ],
  },
  {
    type: 'investment',
    label: 'Archived',
    items: [
      make('cradle', '2019/07/cradle.png', 'Cradle Genomics logo'),
    ],
  },
];

export const philanthropyAssets: AssetGroup[] = [
  {
    type: 'philanthropy',
    label: 'Philanthropy & Academia',
    items: [
      make('belizekids', '2018/05/belize.png', 'BelizeKids.org logo', 'https://belizekids.org/'),
      make('canary-foundation', '2018/05/cf.png', 'Canary Foundation logo', 'https://www.canaryfoundation.org/'),
      make('lucile', '2019/03/lucile.png', 'Lucile Packard Children’s Hospital logo'),
      make('moffitt', '2018/05/moffitt.png', 'Moffitt Cancer Center logo'),
      make('nih', '2018/05/nih.png', 'National Institutes of Health logo', 'https://www.cancer.gov/'),
      make('stanford', '2018/05/stanford.png', 'Stanford Medicine logo', 'https://med.stanford.edu/'),
      make('saskatchewan', '2019/03/saskatchewan.png', 'University of Saskatchewan crest'),
      make('canary-challenge', '2018/05/cc.png', 'Canary Challenge logo'),
    ],
  },
];

export const belizeKidsGallery: VisualAsset[] = [
  make(
    'belizekids-vision-clinic',
    '2020/09/vision-clinic.jpg',
    'Eye exam at the Stanford Belize Vision Clinic',
    'https://belizekids.org/',
  ),
  make('belizekids-canary-cove', '2020/09/boca.jpg', 'Canary Cove playground in Belize'),
  make('belizekids-hol-chan', '2020/09/hol-chan.jpg', 'Sea turtle at Hol Chan Marine Reserve'),
  make('belizekids-community-dive', '2020/09/food-drive.jpg', 'Belize community members gathered on a dive boat'),
  make('belizekids-donation', '2020/09/tour-guide.jpg', 'Tour guide association members with donated marine equipment'),
  make('belizekids-dolla-dive', '2020/09/dolla-dive.jpg', 'Two divers taking part in a Belize fundraising dive'),
];

export type { AssetGroup };
