import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ====== اتصال بقاعدة البيانات ======
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// ====== نماذج البيانات ======
const userSchema = new mongoose.Schema({
  userId: String,
  birthDate: Date,
  lastAccessDate: String, // صيغة YYYY-MM-DD
  dailyLuck: Number,      // 0 - 100
  shareCount: { type: Number, default: 0 },
});

const horoscopeSchema = new mongoose.Schema({
  sign: String,       // اسم البرج
  prediction: String, // نص التوقع
});

const User = mongoose.model("User", userSchema);
const Horoscope = mongoose.model("Horoscope", horoscopeSchema);

// ====== دالة مساعدة لحساب البرج ======
function getHoroscopeSign(birthDate) {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const signs = [
    { sign: "الحمل",  from: [3, 21],  to: [4, 19]  },
    { sign: "الثور",  from: [4, 20],  to: [5, 20]  },
    { sign: "الجوزاء",from: [5, 21],  to: [6, 20]  },
    { sign: "السرطان",from: [6, 21],  to: [7, 22]  },
    { sign: "الأسد",  from: [7, 23],  to: [8, 22]  },
    { sign: "العذراء",from: [8, 23],  to: [9, 22]  },
    { sign: "الميزان",from: [9, 23],  to: [10, 22] },
    { sign: "العقرب", from: [10, 23], to: [11, 21] },
    { sign: "القوس",  from: [11, 22], to: [12, 21] },
    { sign: "الجدي",  from: [12, 22], to: [1, 19]  },
    { sign: "الدلو",  from: [1, 20],  to: [2, 18]  },
    { sign: "الحوت",  from: [2, 19],  to: [3, 20]  },
  ];

  for (const s of signs) {
    const [fm, fd] = s.from;
    const [tm, td] = s.to;
    const inStart = (month === fm && day >= fd);
    const inEnd   = (month === tm && day <= td);
    if (inStart || inEnd) return s.sign;
  }
  return "غير معروف";
}

// ====== المسارات (API Endpoints) ======

// 1) تسجيل مستخدم
app.post("/api/register", async (req, res) => {
  try {
    const { userId, birthDate } = req.body;
    if (!userId || !birthDate) {
      return res.status(400).json({ error: "userId و birthDate مطلوبين" });
    }
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, birthDate });
      await user.save();
    }
    res.json({ message: "User registered", user });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2) حظ اليوم (مرة في اليوم)
app.get("/api/dailyLuck/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    if (user.lastAccessDate === today) {
      return res.json({
        message: "شفت حظك اليوم، ارجع بكرة 😉",
        dailyLuck: user.dailyLuck,
      });
    }

    const luck = Math.floor(Math.random() * 101); // 0..100
    user.dailyLuck = luck;
    user.lastAccessDate = today;
    await user.save();

    res.json({
      message: "تم تحديث حظك لليوم 🎉",
      dailyLuck: luck,
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3) تسجيل مشاركة (يزيد العداد 1)
app.post("/api/share", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId مطلوب" });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.shareCount += 1;
    await user.save();
    res.json({ shareCount: user.shareCount });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// 4) توقعات البرج (بعد 3 مشاركات)
app.get("/api/horoscope/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.shareCount < 3) {
      return res.json({
        message: "شارك التطبيق مع 3 أشخاص لتشوف توقعات برجك 🌟",
        shareCount: user.shareCount
      });
    }

    const sign = getHoroscopeSign(user.birthDate);
    const predictionDoc = await mongoose.model("Horoscope").findOne({ sign });
    res.json({
      sign,
      prediction: predictionDoc?.prediction || "لا توجد توقعات حالياً 😅",
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ====== تشغيل السيرفر ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
