export type ServiceCategoryKey='hair'|'nails'|'lashes'|'beauty';
export type CatalogItem={key:string;label:string;description:string};
export type ServiceCategory={key:ServiceCategoryKey;label:string;shortLabel:string;description:string;items:CatalogItem[]};

export const SERVICE_CATALOG:ServiceCategory[]=[
  {key:'hair',label:'美髮',shortLabel:'美髮',description:'洗、剪、染、燙、護與造型',items:[
    {key:'hair_wash',label:'洗髮／造型',description:'洗髮、吹整、基礎造型'},
    {key:'hair_cut',label:'剪髮',description:'男女剪髮、層次與造型調整'},
    {key:'hair_color',label:'染髮',description:'單色染、漂髮、特殊色與設計染'},
    {key:'hair_perm',label:'燙髮',description:'冷燙、熱塑燙、髮根與局部燙'},
    {key:'hair_care',label:'護髮',description:'結構護理、深層修護與頭皮保養'},
    {key:'hair_style',label:'造型',description:'宴會、活動與日常造型'}]},
  {key:'nails',label:'美甲',shortLabel:'美甲',description:'手足保養、凝膠、造型與卸甲',items:[
    {key:'nails_gel',label:'凝膠美甲',description:'單色、跳色、鏡面與基礎凝膠'},
    {key:'nails_art',label:'造型美甲',description:'彩繪、飾品、延甲與指定款式'},
    {key:'nails_manicure',label:'手部保養',description:'修型、甘皮與手部保養'},
    {key:'nails_pedicure',label:'足部保養',description:'足部修型、甘皮與保養'},
    {key:'nails_remove',label:'卸甲',description:'凝膠／延甲卸除與修護'}]},
  {key:'lashes',label:'美睫',shortLabel:'美睫',description:'接睫、睫毛管理、補睫與卸睫',items:[
    {key:'lashes_extension',label:'接睫毛',description:'單根、濃密、自然款與客製設計'},
    {key:'lashes_lift',label:'睫毛管理',description:'睫毛捲翹、角蛋白與整理'},
    {key:'lashes_fill',label:'補睫',description:'既有睫毛補量與調整'},
    {key:'lashes_remove',label:'卸睫',description:'安全卸除與清潔保養'}]},
  {key:'beauty',label:'美容／美體',shortLabel:'美容美體',description:'臉部保養、除毛、按摩與身體管理',items:[
    {key:'beauty_facial',label:'臉部保養',description:'清潔、保濕、修護與膚況管理'},
    {key:'beauty_acne',label:'粉刺／痘肌管理',description:'粉刺清潔與痘肌保養'},
    {key:'beauty_waxing',label:'除毛',description:'熱蠟、局部與身體除毛'},
    {key:'beauty_massage',label:'按摩／舒壓',description:'肩頸、全身與局部舒壓'},
    {key:'beauty_body',label:'美體管理',description:'身體保養、體態與循環管理'}]}
];

export function categoryByKey(key:string|undefined|null){return SERVICE_CATALOG.find(x=>x.key===key);}
export function itemByKey(key:string|undefined|null){for(const c of SERVICE_CATALOG){const i=c.items.find(x=>x.key===key);if(i)return {...i,category:c};}return undefined;}
export function allCatalogItems(){return SERVICE_CATALOG.flatMap(c=>c.items.map(i=>({...i,categoryKey:c.key,categoryLabel:c.label})));}
