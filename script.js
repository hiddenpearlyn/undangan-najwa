// === Helpers ===
const eventStart = new Date("2026-07-06T16:30:00+07:00");
let rsvpChoice = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function typeText(element, text, speed = 36, appendNewline = false) {
  return new Promise((resolve) => {
    let index = 0;
    const timer = setInterval(() => {
      element.textContent += text.charAt(index);
      index += 1;
      if (index >= text.length) {
        clearInterval(timer);
        if (appendNewline) element.textContent += "\n";
        resolve();
      }
    }, speed);
  });
}

function createConfetti(container = document.querySelector("#confetti-layer"), amount = 70) {
  const colors = ["#DCC8FF", "#B99CFF", "#CFE8FF", "#B6E8B0", "#FFB6B6", "#FFFFFF"];

  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-20 - Math.random() * 60}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${1.2 + Math.random() * 1.4}s`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 3400);
  }
}

// === SECTION: Boot Screen ===
async function runBootScreen() {
  const heading = document.querySelector("#boot-heading");
  const list = document.querySelector("#boot-list");
  const success = document.querySelector("#boot-success");
  const enterButton = document.querySelector("#enter-button");
  const bootItems = [
    "loading courage...",
    "loading doa emak...",
    "loading revisi...",
    "loading kopi...",
    "loading tawakal..."
  ];

  await typeText(heading, "booting wawa.exe...", 38);
  await sleep(250);

  for (const label of bootItems) {
    const row = document.createElement("div");
    row.className = "boot-row";
    row.innerHTML = `<span>[ ] ${label}</span><div class="boot-progress"><span></span></div>`;
    list.appendChild(row);
    await sleep(120);
    row.querySelector(".boot-progress span").style.width = "100%";
    await sleep(500);
    row.querySelector("span").textContent = `[✓] ${label}`;
  }

  await typeText(success, "✓ SUCCESS", 38);
  enterButton.classList.remove("is-hidden");
}

function setupBootEnter() {
  document.querySelector("#enter-button").addEventListener("click", () => {
    document.body.classList.add("boot-done");
    setTimeout(() => {
      document.querySelector("#boot-screen").style.display = "none";
      document.querySelector("#mission-complete").scrollIntoView({ behavior: "smooth" });
    }, 560);
  });
}

// === SECTION: Image Fallbacks ===
function setupImageFallbacks() {
  document.querySelectorAll(".meme-img").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("is-hidden");
      const fallback = document.querySelector(`.${img.dataset.fallback}`);
      if (fallback) fallback.classList.add("is-visible");
    });
  });
}

// === SECTION: Reveals, Timeline, Navigation ===
function setupObservers() {
  let endingCelebrated = false;
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.id === "ending" && !endingCelebrated) {
          endingCelebrated = true;
          createConfetti(document.querySelector("#confetti-layer"), 90);
        }
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal-section").forEach((section) => revealObserver.observe(section));

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target.dataset.fill;
        entry.target.style.setProperty("--fill", `${fill}%`);
        entry.target.classList.add("is-filled");
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll(".timeline-row").forEach((row) => timelineObserver.observe(row));

  const dots = [...document.querySelectorAll(".dot-nav a")];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      dots.forEach((dot) => {
        dot.classList.toggle("is-active", dot.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.55 });

  document.querySelectorAll("main > section").forEach((section) => sectionObserver.observe(section));
}

// === SECTION: Voting ===
function openVoteModal(button) {
  const modal = document.querySelector("#vote-modal");
  const image = document.querySelector("#vote-modal-img");
  const caption = document.querySelector("#vote-modal-caption");
  const boardTitle = document.querySelector("#modal-board-title");
  const fallback = document.querySelector(".poster-modal");

  image.classList.remove("is-hidden");
  fallback.classList.remove("is-visible");
  image.src = button.dataset.meme;
  caption.textContent = button.dataset.modalCaption;
  boardTitle.textContent = button.dataset.modalBoard;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeVoteModal() {
  const modal = document.querySelector("#vote-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".vote-card").forEach((button) => {
    button.classList.remove("is-dim");
  });
}

function setupVoting() {
  const voteMessage = document.querySelector("#vote-message");
  const exitPoll = document.querySelector("#exit-poll");
  const badges = document.querySelector("#vote-badges");

  document.querySelectorAll(".vote-card").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.choice === "valid") {
        document.querySelectorAll(".vote-card").forEach((card) => {
          card.classList.toggle("is-dim", card !== button);
          card.classList.remove("is-valid");
          card.querySelector(".checkbox").textContent = "☐";
        });
        button.classList.remove("is-dim");
        button.classList.add("is-valid");
        button.querySelector(".checkbox").textContent = "☑";
        badges.innerHTML = '<span class="badge">SUARA SAH 100%</span><span class="badge">KOALISI SUPPORT SYSTEM MENANG</span>';
        voteMessage.textContent = "✅ SUARA SAH. RAKYAT MEMILIH HADIR.";
        exitPoll.textContent = "EXIT POLL: 100% rakyat memilih makan-makan setelah sidang.";
        createConfetti(document.querySelector("#confetti-layer"), 55);
        return;
      }

      button.classList.add("is-dim");
      openVoteModal(button);
    });
  });

  document.querySelector("#close-vote-modal").addEventListener("click", closeVoteModal);
  document.querySelector("#vote-modal").addEventListener("click", (event) => {
    if (event.target.id === "vote-modal") closeVoteModal();
  });
}

// === SECTION: Invitation ===
function setupSaveDate() {
  document.querySelector("#save-date").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//wawa.exe//After Sidang Munaqasah//ID",
      "BEGIN:VEVENT",
      "UID:after-sidang-najwa-20260706@wawa.exe",
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      "DTSTART:20260706T093000Z",
      "DTEND:20260706T110000Z",
      "SUMMARY:After Sidang Munaqasah Najwa",
      "LOCATION:F974+MJX, Rimba Panjang, Kec. Tambang, Kabupaten Kampar, Riau 28293",
      "DESCRIPTION:After sidang santai bersama Najwa. Maps: https://maps.app.goo.gl/G31s2MoTKZaC1rNH6. Dress code bebas, nyaman, tetap sopan.",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "after-sidang-najwa.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

// === SECTION: Countdown ===
function updateCountdown() {
  const now = new Date();
  const distance = eventStart.getTime() - now.getTime();
  const clock = document.querySelector("#countdown-clock");
  const status = document.querySelector("#countdown-status");

  if (distance <= 0) {
    clock.style.display = "none";
    status.innerHTML = "THE MISSION HAS STARTED<br>Sampai jumpa di lokasi!";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.querySelector("#clock-days").textContent = String(days).padStart(2, "0");
  document.querySelector("#clock-hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#clock-minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#clock-seconds").textContent = String(seconds).padStart(2, "0");
}

// === SECTION: RSVP ===
function setupRsvp() {
  const response = document.querySelector("#rsvp-response");
  const messages = {
    hadir: "Yeay! Sampai jumpa :33",
    insyaallah: "Ditunggu yaapps🤍",
    doakan: "Makasih doanyaaa🙏"
  };

  document.querySelectorAll("[data-rsvp]").forEach((button) => {
    button.addEventListener("click", () => {
      rsvpChoice = button.dataset.rsvp;
      document.querySelectorAll("[data-rsvp]").forEach((item) => {
        item.classList.toggle("is-selected", item === button);
        item.classList.toggle("is-disabled", item !== button);
        item.disabled = item !== button;
      });
      response.classList.remove("is-visible");
      response.textContent = messages[rsvpChoice];
      requestAnimationFrame(() => response.classList.add("is-visible"));
      if (rsvpChoice === "hadir") createConfetti(document.querySelector("#confetti-layer"), 90);
    });
  });
}

// === SECTION: Music Player ===
function setupMusic() {
  const music = document.querySelector("#music");
  const toggle = document.querySelector("#music-toggle");

  const markPlaying = () => {
    toggle.textContent = "⏸";
    toggle.setAttribute("aria-label", "Jeda musik");
    toggle.classList.add("is-playing");
  };

  const markPaused = () => {
    toggle.textContent = "▶";
    toggle.setAttribute("aria-label", "Putar musik");
    toggle.classList.remove("is-playing");
  };

  const tryAutoplay = async () => {
    try {
      await music.play();
      markPlaying();
    } catch {
      const playAfterFirstClick = async () => {
        try {
          await music.play();
          markPlaying();
        } catch {
          toggle.textContent = "♪";
          toggle.setAttribute("aria-label", "File musik belum tersedia");
        }
      };
      document.addEventListener("click", playAfterFirstClick, { once: true });
    }
  };

  tryAutoplay();

  toggle.addEventListener("click", async () => {
    try {
      if (music.paused) {
        await music.play();
        markPlaying();
      } else {
        music.pause();
        markPaused();
      }
    } catch {
      toggle.textContent = "♪";
      toggle.setAttribute("aria-label", "File musik belum tersedia");
    }
  });
}

// === SECTION: Easter Egg ===
async function openEggModal() {
  const modal = document.querySelector("#egg-modal");
  const text = document.querySelector("#egg-text");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  text.textContent = "";
  await typeText(text, "sudo acc_munaqasah", 36, true);
  await typeText(text, "Processing...", 36, true);
  await typeText(text, "✔ accepted", 36, false);
}

function closeEggModal() {
  const modal = document.querySelector("#egg-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function setupEasterEgg() {
  let clickCount = 0;
  document.querySelector("#mc-title").addEventListener("click", () => {
    clickCount += 1;
    if (clickCount >= 7) {
      clickCount = 0;
      openEggModal();
    }
  });

  document.querySelector(".modal-x").addEventListener("click", closeEggModal);
  document.querySelector("#egg-modal").addEventListener("click", (event) => {
    if (event.target.id === "egg-modal") closeEggModal();
  });
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  runBootScreen();
  setupBootEnter();
  setupImageFallbacks();
  setupObservers();
  setupVoting();
  setupSaveDate();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupRsvp();
  setupMusic();
  setupEasterEgg();
});
