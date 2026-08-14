import { Demand, Provider, Quote } from './types';

export const serviceOptions = [
  {key:'wash', label:'洗髮'}, {key:'cut', label:'剪髮'}, {key:'color', label:'染髮'},
  {key:'perm', label:'燙髮'}, {key:'care', label:'護髮'}, {key:'style', label:'造型'}
] as const;

const works = [
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80'
];

export const providers: Provider[] = [
  {
    id:'p1', name:'Mina', salon:'LUMI Hair',
    avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    cover:'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80',
    rating:4.9, reviews:128, completed:214, distanceKm:0.7, availableText:'15 分鐘後可服務', isAvailableNow:true,
    location:'竹北市光明六路東一段', specialties:['女生剪髮','霧感髮色','韓系燙髮'],
    intro:'擅長自然、耐看的髮型設計。先看髮況，再給你能真正做得到的建議。', instagram:'@mina.lumi', works,
    services:[{label:'洗髮造型',price:'NT$ 500 起'},{label:'剪髮',price:'NT$ 1,000 起'},{label:'染髮',price:'NT$ 2,800 起'},{label:'燙髮',price:'NT$ 3,200 起'}]
  },
  {
    id:'p2', name:'阿哲', salon:'MORI SALON',
    avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    cover:'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1400&q=80',
    rating:4.9, reviews:96, completed:176, distanceKm:1.1, availableText:'今天 16:30', isAvailableNow:false,
    location:'竹北市成功十街', specialties:['男生剪髮','層次剪裁','自然捲整理'],
    intro:'重視回家整理難度，會把造型方式講清楚。', instagram:'@ze.mori', works:[...works].reverse(),
    services:[{label:'洗髮造型',price:'NT$ 450 起'},{label:'剪髮',price:'NT$ 900 起'},{label:'燙髮',price:'NT$ 2,600 起'}]
  },
  {
    id:'p3', name:'Ivy', salon:'SENSE Hair Studio',
    avatar:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80',
    cover:'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1400&q=80',
    rating:4.8, reviews:74, completed:121, distanceKm:1.8, availableText:'25 分鐘後可服務', isAvailableNow:true,
    location:'竹北市嘉豐五路', specialties:['染髮','護髮','長髮燙髮'],
    intro:'喜歡有光澤、乾淨透明的髮色與自然捲度。', instagram:'@ivy.sense', works,
    services:[{label:'護髮',price:'NT$ 1,200 起'},{label:'染髮',price:'NT$ 2,500 起'},{label:'燙髮',price:'NT$ 3,500 起'}]
  }
];

export const demoDemand: Demand = {
  id:'d1', service:'wash', serviceLabel:'洗髮 / 造型', when:'now', dateText:'今天 15:00～17:30',
  budgetMin:500,budgetMax:800, location:'竹北市 · 3 公里內', notes:'等等有聚餐，希望洗完有自然蓬鬆感，不要太貼頭皮。',
  hairLength:'中長髮', styleTags:['自然','乾淨','年輕感'], photoUrls:[works[0]], quoteCount:3, status:'collecting', createdAt:'剛剛'
};

export const demoQuotes: Quote[] = [
  {id:'q1', demandId:'d1', providerId:'p1', price:500, availableAt:'今天 15:30', message:'現在前一位快結束，15:30 可以直接幫你安排，會包含洗髮＋簡單造型。', included:['洗髮','基礎頭皮清潔','吹整造型'], workImages:works.slice(0,3), createdAt:'2 分鐘前'},
  {id:'q2', demandId:'d1', providerId:'p2', price:600, availableAt:'今天 16:30', message:'如果你不趕時間，16:30 可以，會依照你頭型把髮根蓬度吹出來。', included:['洗髮','吹整造型'], workImages:works.slice(3,6), createdAt:'5 分鐘前'},
  {id:'q3', demandId:'d1', providerId:'p3', price:650, availableAt:'今天 15:50', message:'可以接，洗髮會先看頭皮狀況，造型想要自然或比較有捲度都可以。', included:['洗髮','頭皮判斷','造型'], workImages:works.slice(1,4), createdAt:'8 分鐘前'}
];
