/**
 * ============================================
 *  RUNGKIJ — Project Search Data
 *  แก้ไขข้อมูลโครงการได้ที่ไฟล์นี้
 *  status: "open" = เปิดขาย | "soon" = Coming Soon | "sold" = ขายหมด
 * ============================================
 */
var RK_PROJECTS = [
  {
    name: "Hampton Grove",
    type: "บ้านเดี่ยว",
    units: 89,
    location: "มอเตอร์เวย์ — กรุงเทพกรีฑาตัดใหม่",
    district: "สะพานสูง",
    nearby: ["มอเตอร์เวย์", "กรุงเทพกรีฑา", "สุวรรณภูมิ", "สนามบิน", "ลาดกระบัง"],
    price: "เริ่ม 7 ล้าน+",
    image: "images/hampton/render-1.webp",
    url: "project-hampton-grove.html",
    badge: "Coming Soon",
    status: "soon"
  },
  {
    name: "Grand Verona",
    type: "บ้านเดี่ยว / ทาวน์โฮม",
    units: 189,
    location: "รามคำแหง — ร่มเกล้า",
    district: "มีนบุรี",
    nearby: ["รามคำแหง", "ร่มเกล้า", "สุวินทวงศ์", "มีนบุรี", "สนามบิน", "สุวรรณภูมิ", "มอเตอร์เวย์"],
    price: "เริ่ม 3.99 ล้าน",
    image: "images/grand-verona/maingate.webp",
    url: "project-grand-verona.html",
    badge: "Premium",
    status: "open"
  },
  {
    name: "Osaka",
    type: "ทาวน์โฮม",
    units: 175,
    location: "รามอินทรา — คู้บอน",
    district: "บางเขน",
    nearby: ["รามอินทรา", "คู้บอน", "ออเงิน", "บางเขน", "สายไหม"],
    price: "เริ่ม 3.99 ล้าน",
    image: "images/osaka/clubhouse.webp",
    url: "project-osaka.html",
    badge: "",
    status: "open"
  },
  {
    name: "The Hampton",
    type: "บ้านเดี่ยว",
    units: 82,
    location: "พระราม 9 — กรุงเทพกรีฑา",
    district: "สะพานสูง",
    nearby: ["พระราม 9", "กรุงเทพกรีฑา", "ศรีนครินทร์", "มอเตอร์เวย์", "สนามบิน", "สุวรรณภูมิ"],
    price: "เริ่ม 7.99 ล้าน",
    image: "images/hampton/render-1.webp",
    url: "project-hampton.html",
    badge: "",
    status: "open"
  },
  {
    name: "The Nice",
    type: "ทาวน์โฮม",
    units: 257,
    location: "รังสิต — คลอง 3",
    district: "ธัญบุรี",
    nearby: ["รังสิต", "คลอง 3", "ธัญบุรี", "ปทุมธานี", "ลำลูกกา", "ฟิวเจอร์พาร์ค"],
    price: "เริ่ม 2.99 ล้าน",
    image: "images/the-nice/exterior-1.webp",
    url: "project-the-nice.html",
    badge: "",
    status: "open"
  },
  {
    name: "The Verona Village",
    type: "ทาวน์โฮม",
    units: 200,
    location: "พระราม 9 — กรุงเทพกรีฑา",
    district: "สะพานสูง",
    nearby: ["พระราม 9", "กรุงเทพกรีฑา", "ศรีนครินทร์", "มอเตอร์เวย์"],
    price: "เริ่ม 3.59 ล้าน",
    image: "images/grand-verona/single-a-1.webp",
    url: "project-the-verona.html",
    badge: "",
    status: "open"
  },
  {
    name: "The Corner นิมิตรใหม่",
    type: "Home Office",
    units: 8,
    location: "ถนนนิมิตรใหม่",
    district: "มีนบุรี",
    nearby: ["นิมิตรใหม่", "มีนบุรี", "หนองจอก", "รามคำแหง"],
    price: "เริ่ม 4.99 ล้าน",
    image: "images/grand-verona/clubhouse-int-1.webp",
    url: "project-the-corner.html",
    badge: "",
    status: "open"
  }
];
