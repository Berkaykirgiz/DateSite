
import { firebaseConfig } from "./firebase.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// ========================================
// FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ========================================
// EKRANLAR
// ========================================

const questionScreen = document.getElementById("questionScreen");
const dateScreen = document.getElementById("dateScreen");
const planScreen = document.getElementById("planScreen");
const summaryScreen = document.getElementById("summaryScreen");


// ========================================
// BUTONLAR
// ========================================

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const planButton = document.getElementById("planButton");
const savePlanButton = document.getElementById("savePlanButton");


// ========================================
// INPUTLAR
// ========================================

const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const errorMessage = document.getElementById("errorMessage");
const noHint = document.getElementById("noHint");


// ========================================
// SEÇİLEN ETKİNLİK
// ========================================

let selectedActivity = null;


// ========================================
// BUGÜNÜ TARİH INPUT'UNUN MİN DEĞERİ YAP
// ========================================

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayString = `${year}-${month}-${day}`;

dateInput.min = todayString;


// ========================================
// HAYIR BUTONU
// ========================================

let noMoveCount = 0;

function moveNoButton() {
    noMoveCount++;

    const maxX = 150;
    const maxY = 100;

    const randomX = Math.random() * (maxX * 2) - maxX;
    const randomY = Math.random() * (maxY * 2) - maxY;

    noButton.style.transform =
        `translate(${randomX}px, ${randomY}px)`;

    if (noMoveCount === 1) {
        noHint.textContent =
            "Hmm... o buton biraz utangaç galiba. 🤭";
    }

    if (noMoveCount === 3) {
        noHint.textContent =
            "Bence Evet'e basmayı denemelisin. 💕";
    }

    if (noMoveCount >= 5) {
        noHint.textContent =
            "Hayır seçeneği şu anda kullanılamıyor. 😌";
    }
}

noButton.addEventListener("mouseenter", moveNoButton);

noButton.addEventListener("touchstart", function (event) {
    event.preventDefault();
    moveNoButton();
});


// ========================================
// EVET BUTONU
// ========================================

yesButton.addEventListener("click", function () {
    questionScreen.classList.add("hidden");
    dateScreen.classList.remove("hidden");

    createFallingHearts(45);
});


// ========================================
// DÜŞEN KALPLER
// ========================================

function createFallingHearts(amount) {

    const heartsContainer =
        document.getElementById("heartsContainer");

    const hearts = [
        "❤️",
        "🩷",
        "💕",
        "💗",
        "💖",
        "💓",
        "💞"
    ];

    for (let i = 0; i < amount; i++) {

        setTimeout(function () {

            const heart =
                document.createElement("div");

            heart.classList.add("falling-heart");

            const randomIndex =
                Math.floor(Math.random() * hearts.length);

            heart.textContent = hearts[randomIndex];

            heart.style.left =
                Math.random() * 100 + "%";

            heart.style.fontSize =
                18 + Math.random() * 22 + "px";

            heart.style.animationDuration =
                3 + Math.random() * 4 + "s";

            heartsContainer.appendChild(heart);

            setTimeout(function () {
                heart.remove();
            }, 8000);

        }, i * 100);
    }
}


// ========================================
// PLANLAMA EKRANINA GEÇ
// ========================================

planButton.addEventListener("click", function () {

    dateScreen.classList.add("hidden");

    planScreen.classList.remove("hidden");

});


// ========================================
// ETKİNLİKLER
// ========================================

const activityButtons =
    document.querySelectorAll(".activity");


activityButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Önce bütün seçimleri kaldır
        activityButtons.forEach(function (item) {
            item.classList.remove("selected");
        });

        // Tıklananı seç
        button.classList.add("selected");

        // Etkinlik adını al
        selectedActivity =
            button.dataset.activity;

        // Hata mesajını temizle
        errorMessage.textContent = "";
    });

});


// ========================================
// ETKİNLİK İKONLARI
// ========================================

function getActivityIcon(activity) {

    const icons = {
        "Kahve": "☕",
        "Film": "🎬",
        "Akşam Yemeği": "🍝",
        "Parkta Yürümek": "🌳",
        "Bir Şeyler İçmek": "🍷",
        "Beni Şaşırt": "🎁"
    };

    return icons[activity] || "💕";
}


// ========================================
// PLANLA BUTONU
// ========================================

savePlanButton.addEventListener("click", async function () {

    const selectedDate =
        dateInput.value;

    const selectedTime =
        timeInput.value;


    // Tarih kontrolü
    if (!selectedDate) {

        errorMessage.textContent =
            "Önce bir tarih seçmelisin. 🌷";

        return;
    }


    // Saat kontrolü
    if (!selectedTime) {

        errorMessage.textContent =
            "Saat seçmeyi unutma. 🕐";

        return;
    }


    // Etkinlik kontrolü
    if (!selectedActivity) {

        errorMessage.textContent =
            "Peki ne yapacağımıza karar verdin mi? 💕";

        return;
    }


    errorMessage.textContent = "";

    savePlanButton.disabled = true;

    savePlanButton.textContent =
        "Planımız hazırlanıyor... 💗";


    try {

        // Firebase Firestore'a kaydet
        await addDoc(
            collection(db, "dates"),
            {
                date: selectedDate,
                time: selectedTime,
                activity: selectedActivity,
                createdAt: serverTimestamp()
            }
        );


        // Özet ekranını göster
        showSummary(
            selectedDate,
            selectedTime,
            selectedActivity
        );


    } catch (error) {

        console.error(
            "Firebase kayıt hatası:",
            error
        );

        errorMessage.textContent =
            "Bir şeyler ters gitti. Lütfen tekrar dene. 💕";

        savePlanButton.disabled = false;

        savePlanButton.textContent =
            "Planla 💗";
    }

});


// ========================================
// ÖZET EKRANI
// ========================================

function showSummary(
    date,
    time,
    activity
) {

    planScreen.classList.add("hidden");

    summaryScreen.classList.remove("hidden");


    // Tarihi Türkçe formata çevir
    const dateObject =
        new Date(date + "T00:00:00");

    const formattedDate =
        dateObject.toLocaleDateString(
            "tr-TR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    // Tarih
    document.getElementById("summaryDate")
        .textContent = formattedDate;


    // Saat
    document.getElementById("summaryTime")
        .textContent = time;


    // Etkinlik
    document.getElementById("summaryActivity")
        .textContent = activity;


    // Etkinlik ikonu
    document.getElementById("summaryActivityIcon")
        .textContent = getActivityIcon(activity);


    // Son bir kalp yağmuru
    createFallingHearts(25);
}
