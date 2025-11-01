import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const horoscopeSchema = new mongoose.Schema({
  sign: String,
  prediction: String,
});
const Horoscope = mongoose.model("Horoscope", horoscopeSchema);

const data = [
  { sign: "الحمل",  prediction: "طاقتك عالية اليوم؛ فرصة لبدء شيء جديد." },
  { sign: "الثور",  prediction: "الهدوء يجلب لك قرارات أفضل؛ لا تتعجّل." },
  { sign: "الجوزاء",prediction: "تواصل اجتماعي ممتاز؛ رسالة سعيدة في طريقها." },
  { sign: "السرطان",prediction: "وقت مناسب للعائلة وترتيب الأولويات." },
  { sign: "الأسد",  prediction: "جاذبيتك لافتة؛ استغلها في إنجاز عمل متأخر." },
  { sign: "العذراء",prediction: "تفاصيل صغيرة تصنع فرقًا كبيرًا اليوم." },
  { sign: "الميزان",prediction: "توازن بين الراحة والإنجاز يعطيك نتائج حلوة." },
  { sign: "العقرب",prediction: "فكّر بعمق قبل أي قرار مالي." },
  { sign: "القوس",  prediction: "مغامرة لطيفة أو فكرة سفر تلوّح بالأفق." },
  { sign: "الجدي",  prediction: "الانضباط يثمر؛ خبر جيّد مهنيًا." },
  { sign: "الدلو",  prediction: "إبداعك حاضر؛ سجّل أفكارك ولا تؤجل." },
  { sign: "الحوت",  prediction: "حدسك قوي؛ اتبعه في اختيارك اليوم." },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Horoscope.deleteMany({});
    await Horoscope.insertMany(data);
    console.log("✅ Seeded horoscopes");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
