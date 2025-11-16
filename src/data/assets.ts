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

const resolvePath = (file: string) => (file.startsWith('http') ? file : `${assetBase}/${file}`);

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
  make('zevx', '2023/02/ZevX-logo-300x141.png', 'ZEVX logo', 'https://zevx.com/'),
  make('carbon-robotics', 'https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762633341/cr-logo_hjlqd1.webp', 'Carbon Robotics logo', 'https://carbonrobotics.com/'),
];

export const boardAssets: AssetGroup[] = [
  {
    type: 'board',
    label: 'Current Boards',
    items: [
      make('belizekids', '2018/05/belize.png', 'BelizeKids.org logo', 'https://belizekids.org/'),
      make('canary-foundation', '2018/05/cf.png', 'Canary Foundation logo', 'https://www.canaryfoundation.org/'),
      make('awarex', '2020/05/awarex.png', 'AwareX logo', 'https://www.awarex.com/'),
      make('calix', '2018/05/calix.png', 'Calix logo', 'https://www.calix.com/'),
      make('dwave', '2018/05/dwave.png', 'D-Wave Systems logo', 'https://www.dwavesys.com/'),
      make('poet', '2020/05/poet-02.png', 'POET Technologies logo', 'https://poet-technologies.com/'),
      make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
      make('robin', '2020/05/robin-02.png', 'Robin Systems logo', 'https://robin.io/'),
      make('teradici', '2018/05/teradici.png', 'Teradici logo', 'https://www.teradici.com/'),
    ],
  },
  {
    type: 'board',
    label: 'CEO Experience',
    items: [
      make('openwave', '2018/05/openwave.png', 'Openwave logo'),
      make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
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
      make('genologics', '2018/05/genologics.png', 'GenoLogics logo'),
      make('joyent', '2018/05/joyent.png', 'Joyent logo'),
      make('plumgrid', '2018/05/plumgrid.png', 'PLUMgrid logo'),
      make('rapidai', '2020/05/rapid-ai.png', 'RapidAI logo', 'https://www.rapidai.com/'),
      make('robin', '2020/05/robin-02.png', 'Robin Systems logo', 'https://robin.io/'),
      make('teradici', '2018/05/teradici.png', 'Teradici logo', 'https://www.teradici.com/'),
      make('openwave', '2018/05/openwave.png', 'Openwave logo'),
    ],
  },
];

export const investmentAssets: AssetGroup[] = [
  {
    type: 'investment',
    label: 'Seed',
    items: [
      make('uberflip', '2018/05/uberflip.png', 'Uberflip', 'https://www.uberflip.com/'),
      make('vida', '2022/05/vida.png', 'VIDA lung health', 'https://www.vidalung.ai/'),
      make('cradle', '2019/07/cradle.png', 'Cradle Genomics logo', 'https://www.cradlegenomics.com/'),
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
      make('hwvp', 'https://www.hummerwinblad.com/wp-content/themes/hwvpfoundation/dist/images/hwvp-logo.svg', 'HWVP logo', 'https://www.hummerwinblad.com/'),
      make('rally', '2018/05/rally.png', 'Rally Ventures logo', 'https://rallyventures.com/'),
      make('sequoia', '2018/05/stanford.png', 'Sequoia tech partner logo', 'https://www.sequoiacap.com/'),
      make('telesoft', 'https://telesoftpartners.com/wp-content/uploads/2015/01/telesoft-logo.png', 'TeleSoft Partners logo', 'https://telesoftpartners.com/'),
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
    'belizekids-community-health',
    'https://i.imgur.com/N1PGdy7.jpg',
    'BelizeKids.org volunteer team preparing supplies for community clinics',
    'https://belizekids.org/',
  ),
  make('belizekids-classroom', 'https://i.imgur.com/lx4GcRr.jpg', 'Hands-on STEM workshop with Belizean students'),
  make('belizekids-eye-care', 'https://i.imgur.com/0Qjoc64.jpg', 'Stanford-led eye care outreach in Belize'),
  make('belizekids-reef', 'https://i.imgur.com/UNzoaBD.jpg', 'Marine conservation dive supporting reef restoration'),
  make('belizekids-community-partners', 'https://i.imgur.com/IJKaTAA.jpg', 'Local partners collaborating on education programs'),
  make('belizekids-mentorship', 'https://i.imgur.com/44skZfu.jpg', 'Mentorship circle with scholarship recipients'),
  make('belizekids-tech-lab', 'https://i.imgur.com/r8J764N.jpg', 'Mobile technology lab brought to coastal schools'),
  make('belizekids-celebration', 'https://i.imgur.com/BHPVT5L.jpg', 'Celebration with students after completing summer institute'),
  make('carbon-robotics', 'https://res.cloudinary.com/dhqpqfw6w/image/upload/v1762633341/cr-logo_hjlqd1.webp', 'Carbon Robotics logo', 'https://carbonrobotics.com/'),
  make('dwave', '2018/05/dwave.png', 'D-Wave Systems logo', 'https://www.dwavesys.com/'),
  make('robin', '2020/05/robin-02.png', 'Robin Systems logo', 'https://robin.io/'),
];

export type { AssetGroup };
