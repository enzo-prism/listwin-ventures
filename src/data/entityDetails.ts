import {
  boardAssets,
  heroAssets,
  investmentAssets,
  philanthropyAssets,
  type VisualAsset,
} from './assets';

type Category = 'board' | 'investment' | 'philanthropy' | 'hero';

type DetailContent = {
  summary: string;
  highlights: string[];
};

export type EntityDetail = {
  slug: string;
  name: string;
  categories: Category[];
  summary: string;
  highlights: string[];
  externalUrl?: string;
  asset: VisualAsset;
};

const assetIndex = new Map<string, VisualAsset>();
const categoryIndex = new Map<string, Set<Category>>();

const registerGroup = (assets: VisualAsset[], category: Category, omit: string[] = []) => {
  assets.forEach((asset) => {
    if (omit.includes(asset.id)) return;
    assetIndex.set(asset.id, asset);
    const current = categoryIndex.get(asset.id) ?? new Set<Category>();
    current.add(category);
    categoryIndex.set(asset.id, current);
  });
};

registerGroup(heroAssets, 'hero', ['don-listwin']);
boardAssets.forEach((group) => registerGroup(group.items, 'board'));
investmentAssets.forEach((group) => registerGroup(group.items, 'investment'));
registerGroup(philanthropyAssets.flatMap((group) => group.items), 'philanthropy');

const content: Record<string, DetailContent> = {
  awarex: {
    summary: 'AwareX provides a custom engagement platform for mobile phone users.',
    highlights: [
      'Lets carriers deliver tailored billing, support, and self-serve journeys inside branded apps.',
      'Board guidance keeps the platform tuned to telecom-scale personalization and reliability.',
    ],
  },
  belizekids: {
    summary:
      'BelizeKids.org (Founder & Chairman) is a non-profit organization partnering with businesses to support the needs of kids in Belize.',
    highlights: [
      'Runs joint programs with Stanford Medicine to deliver eye care and chronic-disease screening.',
      'Scholarships, maker labs, and dive expeditions help local students pursue technology careers.',
    ],
  },
  bdc: {
    summary:
      'BDC (Business Development Bank of Canada) finances and mentors Canadian entrepreneurs, with deep reach into regional innovation hubs.',
    highlights: [
      'Partnering with BDC connects Canadian founders in Don’s network to growth capital and export support.',
      'BDC’s evergreen mandate makes it a resilient co-investor for long-horizon infrastructure bets.',
    ],
  },
  c100: {
    summary:
      'C100 is a nonprofit network of Canadian founders and operators in Silicon Valley, accelerating mentorship and capital for Canada-built startups.',
    highlights: [
      'Don contributes operating lessons from Cisco and RapidAI to C100 cohorts and summits.',
      'The group bridges Canadian universities, venture firms, and Bay Area leadership.',
    ],
  },
  calix: {
    summary:
      'Calix is a leading provider of next generation fiber optic based broadband solutions.',
    highlights: [
      'Don serves as Lead Independent Director, focusing on go-to-market discipline and customer success.',
      'Calix Cloud and Revenue EDGE help providers launch new services without heavy engineering teams.',
    ],
  },
  'carbon-robotics': {
    summary:
      'Carbon Robotics builds autonomous farm robots that pair computer vision with high-powered lasers to eliminate weeds while protecting soil health.',
    highlights: [
      'Invests at the intersection of AI, robotics, and sustainability—aligning with Don’s thesis on data-rich industrial systems.',
      'Carbon Robotics helps growers boost yields, reduce herbicide use, and capture detailed agronomic data with each pass.',
    ],
  },
  'canary-foundation': {
    summary:
      'Canary Foundation (Founder & CEO) has been the only foundation in the world focused solely on early cancer detection for over 15 years.',
    highlights: [
      'Funded collaborative centers at Stanford, Cambridge, and Calgary to translate lab breakthroughs to clinics.',
      'Catalyzed new standards of care for prostate and ovarian cancer screening.',
    ],
  },
  'canary-challenge': {
    summary:
      'The Canary Challenge is a flagship charity ride that raises funds for Canary Foundation research and care programs.',
    highlights: [
      'Combines cycling, community, and patient stories to fund early-cancer trials.',
      'Corporate teams use the ride to engage employees around prevention and wellness.',
    ],
  },
  clarius: {
    summary:
      'Clarius Mobile Health empowers every medical professional with accurate, easy to use and affordable imaging tools.',
    highlights: [
      'Handheld ultrasound scanners pair with smartphones so clinicians can scan anywhere care happens.',
      'AI-enhanced software keeps imaging workflows intuitive for emergency, MSK, and OB teams.',
    ],
  },
  cradle: {
    summary:
      'Cradle Genomics engineers next-generation prenatal diagnostic tests that combine genomics with proprietary biochemistry.',
    highlights: [
      'Investment supports the shift toward safer, noninvasive prenatal testing.',
      'Cradle’s platform exemplifies Don’s interest in applying engineering rigor to medical diagnostics.',
    ],
  },
  dwave: {
    summary:
      'D-Wave Systems is the world’s only functional quantum computer.',
    highlights: [
      'Don backed the company early as it bridged physics breakthroughs into enterprise-grade systems.',
      'Customers use D-Wave quantum solutions for logistics, cybersecurity, and drug discovery research.',
    ],
  },
  etek: {
    summary:
      'ETEK Dynamics supplied networking and broadband access equipment during the first wave of internet build-outs.',
    highlights: [
      'Board guidance focused on channel strategy and transitions from legacy copper to packet networks.',
      'Represents Don’s early pattern of supporting infrastructure scale-ups beyond Cisco.',
    ],
  },
  genologics: {
    summary:
      'GenoLogics created laboratory information management software (LIMS) for genomics and proteomics labs.',
    highlights: [
      'Helped translational researchers manage next-generation sequencing workflows.',
      'Exit to Illumina validated Don’s thesis that informatics is key to precision medicine.',
    ],
  },
  isilon: {
    summary:
      'Isilon Systems (acquired by EMC) pioneered scale-out NAS storage tuned for media, genomics, and cloud workloads.',
    highlights: [
      'Board work reinforced Don’s expertise in marrying hardware economics with software simplicity.',
      'Isilon’s architecture became the backbone for countless SaaS and research data lakes.',
    ],
  },
  joyent: {
    summary:
      'Joyent operated one of the earliest public clouds and built the Node.js ecosystem that powers modern web apps.',
    highlights: [
      'Don joined as a director during Joyent’s expansion into enterprise cloud and hybrid deployments.',
      'The company’s innovations in containers and real-time apps influenced today’s developer stacks.',
    ],
  },
  legacy: {
    summary:
      'Legacy Ventures is a hospitality and investment platform that convenes business leaders around philanthropy and venture partnerships.',
    highlights: [
      'Provides relationship capital for boards and founders within Don’s portfolio.',
      'Blends investing with charitable initiatives, aligning with Don’s philanthropic ethos.',
    ],
  },
  lucile: {
    summary:
      'Lucile Packard Children’s Hospital at Stanford delivers pediatric and obstetric care alongside world-class research.',
    highlights: [
      'BelizeKids and Canary Foundation programs collaborate with Lucile Packard clinicians.',
      'A key partner for early detection trials and international training exchanges.',
    ],
  },
  moffitt: {
    summary:
      'Moffitt Cancer Center in Tampa, Florida, is a leading institute for cancer research and patient care.',
    highlights: [
      'Works with Canary Foundation researchers on screening technologies.',
      'Demonstrates Don’s commitment to translating lab insights into clinical protocols.',
    ],
  },
  nih: {
    summary:
      'The National Institutes of Health (NIH) funds biomedical research and sets national priorities for patient care.',
    highlights: [
      'Don served on the National Cancer Institute’s Board of Scientific Advisors under the NIH umbrella.',
      'Partnerships with NIH labs accelerate validation of early-detection biomarkers.',
    ],
  },
  openwave: {
    summary:
      'Openwave (formerly Software.com + Phone.com) created core mobile internet messaging and browser platforms in the early 2000s.',
    highlights: [
      'Don led the company as CEO through the dot-com crash, restructuring it for the next phase of mobile growth.',
      'Lessons from Openwave informed his leadership philosophy for later ventures.',
    ],
  },
  poet: {
    summary:
      'POET Technologies designs photonic integrated circuits that make high-speed optical networking more energy efficient.',
    highlights: [
      'Investment reinforces Don’s long-term bet on bandwidth demand across cloud and AI workloads.',
      'POET’s hybrid silicon platform reduces cost for datacenter transceivers.',
    ],
  },
  plumgrid: {
    summary:
      'PLUMgrid built software-defined networking overlays so enterprises could virtualize complex data center topologies.',
    highlights: [
      'Board participation leveraged Don’s Cisco experience to guide partnerships with OpenStack ecosystems.',
      'Technology anticipated today’s multi-cloud networking patterns.',
    ],
  },
  rally: {
    summary:
      'Rally Ventures is a venture capital firm backing technical founders in enterprise software, data, and security.',
    highlights: [
      'Don is a Venture Partner, helping diligence infrastructure deals and mentor founders.',
      'Rally’s operator-first approach aligns with Don’s roll-up-your-sleeves ethos.',
    ],
  },
  rapidai: {
    summary: 'RapidAI is the worldwide leader in neurovascular imaging.',
    highlights: [
      'Platforms guide stroke teams from the first scan through intervention with AI-enhanced insights.',
      'Leadership in perfusion imaging extended global treatment windows and reshaped stroke protocols.',
    ],
  },
  redback: {
    summary:
      'Redback Networks built edge routers for broadband carriers during the first wave of DSL and fiber deployments.',
    highlights: [
      'Board membership leveraged Don’s Cisco playbook for scaling carrier sales.',
      'Redback’s SmartEdge platforms powered telco triple-play launches worldwide.',
    ],
  },
  robin: {
    summary:
      'ROBIN (Q1 2022) next-generation data center software delivering automated container infrastructure, sold to Rakuten Symphony.',
    highlights: [
      'Platform automated Kubernetes-based infrastructure for data-intensive and telco workloads.',
      'Exit to Rakuten Symphony in Q1 2022 expanded its reach across global telecom clouds.',
    ],
  },
  sana: {
    summary:
      'Sana Security developed behavior-based intrusion prevention software to protect enterprises from emerging threats.',
    highlights: [
      'Don’s CEO experience informed Sana’s go-to-market and eventual acquisition by AVG.',
      'One of the early proofs that machine learning could harden security posture.',
    ],
  },
  saskatchewan: {
    summary:
      'The University of Saskatchewan is Don’s alma mater and a continuing partner for scholarships and entrepreneurship programs.',
    highlights: [
      'Supports engineering students through fellowships and mentorship.',
      'Hosts innovation challenges that link prairie founders with Silicon Valley networks.',
    ],
  },
  sequoia: {
    summary:
      'Sequoia Capital is a global venture firm behind enduring technology companies across consumer, enterprise, and health.',
    highlights: [
      'Don serves as a Technology Partner, advising portfolio teams on go-to-market and scaling.',
      'Sequoia’s scout and expert networks amplify Don’s reach in next-gen infrastructure.',
    ],
  },
  stanford: {
    summary:
      'Stanford Medicine partners with Don through the Canary Center for Cancer Early Detection and BelizeKids medical missions.',
    highlights: [
      'Joint labs blend bioengineering with clinical trials for early diagnostics.',
      'BelizeKids programs host Stanford residents for field training in Belize.',
    ],
  },
  teradici: {
    summary:
      'TERADICI (Q4 2021) multi-cloud access for high-performance devices, sold to HP Inc.',
    highlights: [
      'Invented PCoIP technology that securely streams high-performance desktops to artists, engineers, and cloud workstations.',
      'Earned a 2020 Engineering Emmy® for enabling remote content creation before exiting to HP Inc.',
    ],
  },
  uberflip: {
    summary: 'Uberflip is a next-generation marketing engagement platform.',
    highlights: [
      'Transforms static content into personalized destinations that nurture buyers.',
      'Enables marketing teams to orchestrate engagement journeys that convert faster.',
    ],
  },
  vida: {
    summary:
      'VIDA is a precision lung health company accelerating therapies to patients through AI-powered lung intelligence.',
    highlights: [
      'VIDA Discovery services provide precise quantitative endpoints for respiratory clinical trials.',
      'AI-powered data quality controls, site training, and workflow guidance help sponsors save millions in development costs.',
    ],
  },
  zededa: {
    summary: 'Zededa is a new distributed IoT platform.',
    highlights: [
      'Delivers a cloud-based control plane that keeps edge and IoT deployments secure and observable.',
      'Simplifies how operators roll out and update distributed applications across industrial sites.',
    ],
  },
  zevx: {
    summary:
      'ZEVX retrofits commercial vehicle fleets with intelligent EV powertrains and data services.',
    highlights: [
      'Don transitioned from Executive Chair to CEO to accelerate commercialization.',
      'Closed a $20M+ funding round led by Reynolds Capital to scale manufacturing and partnerships.',
    ],
  },
};

const requiredSlugs = Array.from(new Set([
  'awarex',
  'belizekids',
  'bdc',
  'c100',
  'calix',
  'carbon-robotics',
  'canary-foundation',
  'canary-challenge',
  'clarius',
  'cradle',
  'dwave',
  'etek',
  'genologics',
  'isilon',
  'joyent',
  'legacy',
  'lucile',
  'moffitt',
  'nih',
  'openwave',
  'poet',
  'plumgrid',
  'rally',
  'rapidai',
  'redback',
  'robin',
  'sana',
  'saskatchewan',
  'sequoia',
  'stanford',
  'teradici',
  'uberflip',
  'vida',
  'zededa',
  'zevx',
]));

const ensureContent = (slug: string): DetailContent => {
  const entry = content[slug];
  if (!entry) {
    return {
      summary: 'Additional information coming soon.',
      highlights: ['This organization is part of Don Listwin\'s active portfolio.', 'More context will be published shortly.'],
    };
  }
  return entry;
};

const entityDetails: EntityDetail[] = requiredSlugs
  .map((slug) => {
    const asset = assetIndex.get(slug);
    if (!asset) {
      throw new Error(`Missing asset data for slug: ${slug}`);
    }
    const categories = Array.from(categoryIndex.get(slug) ?? []);
    const detailContent = ensureContent(slug);
    return {
      slug,
      name: asset.name,
      categories,
      summary: detailContent.summary,
      highlights: detailContent.highlights,
      externalUrl: asset.href,
      asset,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const detailMap = new Map(entityDetails.map((detail) => [detail.slug, detail]));

export const getEntityDetails = () => entityDetails;
export const getEntityDetail = (slug: string) => detailMap.get(slug);
export const getDetailPath = (slug: string) => (detailMap.has(slug) ? `/company/${slug}` : undefined);
