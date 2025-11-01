const API_URL = "http://localhost:5000/api";
let userId = localStorage.getItem("userId");

const registerSection = document.getElementById("register-section");
const mainSection = document.getElementById("main-section");
const birthInput = document.getElementById("birthDate");
const luckBtn = document.getElementById("luckBtn");
const shareBtn = document.getElementById("shareBtn");
const horoscopeBtn = document.getElementById("horoscopeBtn");
const resultText = document.getElementById("resultText");
const luckText = document.getElementById("luckText");
const registerBtn = document.getElementById("registerBtn");
const luckResult = document.getElementById("luckResult");

if (!userId) {
  userId = "user_" + Math.random().toString(36).substring(2, 9);
  localStorage.setItem("userId", userId);
}

// 🎂 تسجيل المستخدم
registerBtn.addEventListener("click", async () => {
  const birthDate = birthInput.value;
  if (!birthDate) return alert("الرجاء إدخال تاريخ الميلاد 🎂");

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, birthDate }),
  });
  const data = await res.json();
  if (data.user) {
    registerSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
  } else {
    alert("حدث خطأ أثناء التسجيل 😅");
  }
});

// 🍀 اعرف حظك اليوم
luckBtn.addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/dailyLuck/${userId}`);
  const data = await res.json();

  luckText.innerText = data.message;
  luckResult.classList.remove("hidden");
  luckResult.innerText = data.dailyLuck ? `🎯 ${data.dailyLuck}%` : "-";

  // تغيّر الخلفية حسب النسبة
  const percent = data.dailyLuck || 0;
  if (percent >= 70) {
    document.body.style.background = "linear-gradient(135deg, #c8e6c9, #a5d6a7)";
  } else if (percent >= 40) {
    document.body.style.background = "linear-gradient(135deg, #fff9c4, #fff59d)";
  } else {
    document.body.style.background = "linear-gradient(135deg, #ffcdd2, #ef9a9a)";
  }
});

// 📤 شارك التطبيق (يزيد العداد)
shareBtn.addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  resultText.innerText = `📤 عدد المشاركات: ${data.shareCount}`;
});

// 🔮 توقعات البرج
horoscopeBtn.addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/horoscope/${userId}`);
  const data = await res.json();
  if (data.prediction) {
    resultText.innerText = `♈ برجك: ${data.sign}\n✨ ${data.prediction}`;
  } else {
    resultText.innerText = data.message;
  }
});
