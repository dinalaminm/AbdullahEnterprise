export const CATS=[
 {n:'Mart',i:'fa-store',c:'c-1'},{n:'Fashion',i:'fa-tshirt',c:'c-2'},{n:'Beauty',i:'fa-spray-can',c:'c-3'},
 {n:'Gadgets',i:'fa-gamepad',c:'c-4'},{n:'Home',i:'fa-couch',c:'c-6'},{n:'Sports',i:'fa-futbol',c:'c-7'},{n:'Offers',i:'fa-percent',c:'c-5'}
];
const SIZES=['S','M','L','XL'];
function P(id,name,cat,brand,price,old,stock,rating,reviews,emoji,color,flash,opts,desc){return{id,name,cat,brand,price,old,stock,rating,reviews,emoji,color,flash,opts:opts||[],desc,image:'',added:Date.now()-id.slice(1)*1000}}
export const SEED=[
 P('p1','Wireless Bluetooth Headphones Over Ear - Black','Gadgets','SoundMax',850,1500,25,4.5,120,'🎧','#90caf9',true,[],'Over-ear wireless headphones with deep bass, 20 hours battery life, foldable design and built-in microphone for calls.'),
 P('p2',"Men's Casual Cotton T-Shirt Full Sleeve",'Fashion','UrbanWear',299,600,60,4.2,45,'👕','#a5d6a7',true,SIZES,'Soft 100% cotton full sleeve t-shirt. Breathable, comfortable fit for daily wear.'),
 P('p3','Smart Watch T500 Plus Pro - Calling Function','Gadgets','TechFit',950,2200,18,3.8,210,'⌚','#ce93d8',true,['Black','Pink','Blue'],'Bluetooth calling smart watch with heart rate, step counter, sleep monitor and multiple sports modes.'),
 P('p4','Kitchen Rack Organizer Multi-layer','Home','HomeEase',1250,2500,12,4.8,30,'🗄️','#ffcc80',false,[],'Sturdy multi-layer rack to keep your kitchen tidy. Rust-resistant coating, easy assembly.'),
 P('p5','Mini Portable Electric Fan USB Rechargeable','Gadgets','CoolBreeze',450,800,40,4.1,89,'🌀','#80deea',true,[],'Handheld rechargeable fan with 3 speed settings. Perfect for summer.'),
 P('p6','Sneakers for Men - Stylish White Running Shoes','Fashion','StepUp',1800,3500,20,4.6,15,'👟','#b0bec5',false,['39','40','41','42','43'],'Lightweight running sneakers with cushioned sole and breathable mesh upper.'),
 P('p7','Premium Basmati Rice 5kg','Mart','FreshField',720,820,100,4.7,310,'🍚','#fff59d',false,[],'Long grain premium basmati rice, aromatic and fluffy when cooked.'),
 P('p8','Soybean Oil 5 Litre','Mart','PureDrop',890,950,70,4.4,205,'🛢️','#ffe082',false,[],'Refined soybean oil, rich in vitamin A and D. Ideal for everyday cooking.'),
 P('p9','Red Lentil (Masoor Dal) 2kg','Mart','FreshField',260,300,90,4.3,98,'🫘','#ef9a9a',false,[],'Clean, quality red lentils. Cooks quickly and tastes great.'),
 P('p10','Vitamin C Brightening Face Serum 30ml','Beauty','GlowLab',480,950,35,4.5,167,'🧴','#ffcc80',true,[],'Lightweight serum with 10% Vitamin C to brighten skin and reduce dark spots.'),
 P('p11','Matte Liquid Lipstick Set (6 pcs)','Beauty','RoseBloom',550,1100,28,4.0,64,'💄','#f48fb1',false,[],'Long-lasting matte finish in 6 trendy shades. Smudge proof and waterproof.'),
 P('p12','Herbal Hair Oil 200ml','Beauty','NaturaCare',220,350,80,4.3,142,'🌿','#a5d6a7',false,[],'Herbal blend hair oil that strengthens roots and reduces hair fall.'),
 P('p13','Women Cotton Three-Piece Salwar Kameez','Fashion','Nari',1450,2800,22,4.4,53,'👗','#f8bbd0',false,['M','L','XL'],'Elegant printed three-piece set with soft cotton fabric. Perfect for daily and casual wear.'),
 P('p14','Panjabi for Men - Eid Collection','Fashion','Deshi',1250,2400,30,4.6,77,'🥻','#bcaaa4',true,['M','L','XL','XXL'],'Embroidered premium panjabi with comfortable fabric and modern cut.'),
 P('p15','Non-Stick Fry Pan 28cm','Home','HomeEase',690,1300,26,4.2,41,'🍳','#cfd8dc',false,[],'Durable non-stick coating, even heat distribution, comfortable handle.'),
 P('p16','LED Table Lamp Rechargeable','Home','BrightUp',520,990,34,4.4,59,'💡','#fff176',false,[],'Touch dimmable LED lamp with USB charging and 3 colour modes.'),
 P('p17','Cotton Bed Sheet Set (King)','Home','SleepWell',1150,2200,15,4.5,36,'🛏️','#b39ddb',false,['Blue','Grey','Pink'],'Double bed king-size sheet with 2 pillow covers. Soft and colour fast.'),
 P('p18','Cricket Bat - Kashmir Willow','Sports','ProPlay',1650,2800,10,4.3,22,'🏏','#ffab91',false,[],'Kashmir willow bat with comfortable grip. Great for practice and tournament use.'),
 P('p19','Football Size 5','Sports','ProPlay',780,1300,32,4.4,48,'⚽','#c5e1a5',false,[],'Machine stitched size 5 football with durable PU cover.'),
 P('p20','Yoga Mat 6mm Non-Slip','Sports','FitLife',480,900,45,4.2,70,'🧘','#80cbc4',false,['Purple','Green','Blue'],'Cushioned non-slip yoga mat with carrying strap.'),
 P('p21','Power Bank 20000mAh Fast Charge','Gadgets','VoltEdge',1550,2600,3,4.5,190,'🔋','#ef9a9a',true,[],'20000mAh power bank with dual USB output and 22.5W fast charging.'),
 P('p22','Gaming Mouse RGB 7200 DPI','Gadgets','TechFit',650,1200,0,4.1,83,'🖱️','#9fa8da',false,[],'Wired gaming mouse with RGB lighting and adjustable DPI.'),
 P('p23','Black Seed Honey 500g','Mart','NaturaCare',620,780,50,4.8,260,'🍯','#ffd54f',false,[],'Pure honey infused with black seed. Natural energy and wellness booster.'),
 P('p24','Premium Dates (Ajwa) 500g','Mart','FreshField',1350,1600,40,4.9,330,'🌴','#a1887f',false,[],'Soft and fresh premium Ajwa dates.')
];
export const DEFAULT_COUPONS={
 WELCOME10:{type:'pct',val:10,max:200,min:0,note:'10% off (max ৳200)'},
 SAVE100:{type:'flat',val:100,min:1000,note:'৳100 off on ৳1000+'},
 FREESHIP:{type:'ship',val:0,min:0,note:'Free delivery'}
};
export const STATUS=['Pending','Confirmed','Packed','Shipped','Out for Delivery','Delivered'];
export const DISTRICTS=['Dhaka','Gazipur','Narayanganj','Chattogram','Rajshahi','Khulna','Barishal','Sylhet','Rangpur','Mymensingh','Cumilla','Other'];
export const NEAR=['Dhaka','Gazipur','Narayanganj'];


export const SLIDES=[
 {bg:'linear-gradient(120deg,#f85606,#ff9a3c)',t:'Mega Sale',p:'Up to 60% off on top brands',e:'🛍️',go:'/list?cat=Offers'},
 {bg:'linear-gradient(120deg,#1a535c,#4ecdc4)',t:'New Gadgets',p:'Smart watches, headphones & more',e:'⌚',go:'/list?cat=Gadgets'},
 {bg:'linear-gradient(120deg,#7e57c2,#f48fb1)',t:'Fashion Week',p:'Fresh styles for everyone',e:'👗',go:'/list?cat=Fashion'},
 {bg:'linear-gradient(120deg,#2e7d32,#a5d6a7)',t:'Daily Mart',p:'Groceries delivered to your door',e:'🛒',go:'/list?cat=Mart'}
];
