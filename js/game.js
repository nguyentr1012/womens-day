/**
 * Game tưới hoa với SVG flowers (4 giai đoạn tăng trưởng).
 * Animations: wobble (tưới), bloom+happyBounce→sway (nở hoa).
 * Dùng window.spawnP() từ particles.js.
 */
(function () {
  // ═══════════════════════════════════════════
  //  SVG FLOWER GENERATORS  —  stages 0-2
  // ═══════════════════════════════════════════

  function svgSeed(c) {
    return `<svg viewBox="0 0 56 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="63" rx="20" ry="6" fill="#7a5230" opacity=".7"/>
      <ellipse cx="28" cy="57" rx="8" ry="5.5" fill="${c}" opacity=".9"/>
      <ellipse cx="25" cy="55" rx="2.5" ry="1.5" fill="white" opacity=".45"/>
      <path d="M28 57 Q30 52 28 49" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
    </svg>`;
  }

  function svgSprout(stem, leaf) {
    return `<svg viewBox="0 0 56 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="64" rx="18" ry="5.5" fill="#7a5230" opacity=".65"/>
      <path d="M28 62 Q26 52 28 40" stroke="${stem}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M27 52 Q16 46 18 36 Q24 44 27 52Z" fill="${leaf}"/>
      <path d="M28 46 Q39 40 37 30 Q32 38 28 46Z" fill="${leaf}" opacity=".85"/>
      <circle cx="28" cy="38" r="3.5" fill="${stem}" opacity=".75"/>
    </svg>`;
  }

  function svgBud(stem, leaf, bud) {
    return `<svg viewBox="0 0 56 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="65" rx="17" ry="5" fill="#7a5230" opacity=".6"/>
      <path d="M28 63 Q25 51 28 36" stroke="${stem}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M27 55 Q14 48 17 38 Q23 47 27 55Z" fill="${leaf}"/>
      <path d="M29 48 Q41 42 38 31 Q33 40 29 48Z" fill="${leaf}" opacity=".85"/>
      <ellipse cx="28" cy="27" rx="6.5" ry="9.5" fill="${bud}" opacity=".92"/>
      <ellipse cx="28" cy="28" rx="3.8" ry="7" fill="${bud}"/>
      <path d="M22 31 Q24 23 28 19 Q32 23 34 31 Q30 29 28 31 Q26 29 22 31Z" fill="${leaf}" opacity=".9"/>
      <ellipse cx="24" cy="23" rx="1.5" ry="1" fill="white" opacity=".35"/>
    </svg>`;
  }

  // ── Stage 3: Bloom images from SVG files ─────────────────────
  var bloom0 =
    '<img src="image/smol-sun.svg" style="width:54px;height:68px;display:block" alt="smol-sun">';
  var bloom1 =
    '<img src="image/moon.svg" style="width:54px;height:68px;display:block" alt="moon">';
  var bloom2 =
    '<img src="image/lotus.svg" style="width:54px;height:68px;display:block" alt="lotus">';
  var bloom3 =
    '<img src="image/rose.svg" style="width:54px;height:68px;display:block" alt="rose">';
  var bloom4 =
    '<img src="image/sunflower.svg" style="width:54px;height:68px;display:block" alt="sunflower">';

  // ── 5 Flower configs (4 stages each) ─────────
  var FLOWERS = [
    {
      name: "Hướng dương",
      s: [
        svgSeed("#f5c518"),
        svgSprout("#4a7c1e", "#5cb85c"),
        svgBud("#4a7c1e", "#5cb85c", "#fde68a"),
        bloom0,
      ],
    },
    {
      name: "Peashooter",
      s: [
        svgSeed("#4ade80"),
        svgSprout("#166534", "#4ade80"),
        svgBud("#166534", "#4ade80", "#bbf7d0"),
        bloom1,
      ],
    },
    {
      name: "Hoa tím",
      s: [
        svgSeed("#a855f7"),
        svgSprout("#6d28d9", "#c084fc"),
        svgBud("#6d28d9", "#c084fc", "#ede9fe"),
        bloom2,
      ],
    },
    {
      name: "Hoa hồng",
      s: [
        svgSeed("#ff6b9d"),
        svgSprout("#9d174d", "#fbcfe8"),
        svgBud("#9d174d", "#fbcfe8", "#fce7f3"),
        bloom3,
      ],
    },
    {
      name: "Băng hoa",
      s: [
        svgSeed("#38bdf8"),
        svgSprout("#075985", "#67e8f9"),
        svgBud("#075985", "#67e8f9", "#e0f2fe"),
        bloom4,
      ],
    },
  ];

  window.FLOWERS = FLOWERS;

  // ── Game state ────────────────────────────────
  var N = 5,
    WR = 3,
    TW = 15;
  var wLeft = TW,
    fw = Array(N).fill(0),
    done = 0,
    over = false;

  function buildGarden() {
    var g = document.getElementById("garden");
    g.innerHTML = "";
    FLOWERS.forEach(function (fl, i) {
      var el = document.createElement("div");
      el.className = "pslot";
      el.dataset.i = i;
      el.innerHTML =
        `<div class="fsvg" id="fsvg${i}">${fl.s[0]}</div>` +
        `<div class="lawn-strip"></div>`;
      el.addEventListener("click", function () {
        waterF(i, el);
      });
      g.appendChild(el);
    });
  }

  function waterF(i, slot) {
    if (over || fw[i] >= WR) return;
    if (wLeft <= 0) {
      setHint("💧 Hết nước rồi!");
      return;
    }
    wLeft--;
    fw[i]++;
    document.getElementById("wBadge").textContent = "💧 " + wLeft + " lần tưới";

    // water drops
    var r = slot.getBoundingClientRect();
    for (var d = 0; d < 4; d++) {
      (function (delay) {
        var drop = document.createElement("div");
        drop.className = "wdrop";
        drop.textContent = "💧";
        drop.style.cssText =
          "left:" +
          (r.left + r.width / 2 - 6 + (Math.random() - 0.5) * 20) +
          "px;" +
          "top:" +
          (r.top + 8) +
          "px;animation-delay:" +
          delay +
          "ms";
        document.body.appendChild(drop);
        setTimeout(function () {
          drop.remove();
        }, 720);
      })(d * 75);
    }

    // update water bar (element may be absent if removed from DOM)
    var sbEl = document.getElementById("sb" + i);
    if (sbEl) sbEl.style.width = (fw[i] / WR) * 100 + "%";

    // update SVG stage: 0=seed, 1=sprout, 2=bud, 3=bloom
    var stage = Math.min(fw[i], 3);
    var svgEl = document.getElementById("fsvg" + i);
    svgEl.innerHTML = FLOWERS[i].s[stage];

    // flower-svg class only active at stage 3 (bloom image)
    if (stage === 3) {
      svgEl.classList.add("flower-svg");
    } else {
      svgEl.classList.remove("flower-svg");
    }

    // Reset animation classes → force reflow → re-trigger
    svgEl.classList.remove("bloom", "wobble", "sway", "happy");
    void svgEl.offsetWidth;

    if (fw[i] === WR) {
      // Full bloom: happyBounce + bloom → persistent sway
      svgEl.classList.add("bloom", "happy");
      setTimeout(function () {
        svgEl.classList.remove("bloom", "happy");
        svgEl.classList.add("sway");
      }, 450);

      // star ring vfx
      var ring = document.createElement("div");
      ring.className = "sring";
      slot.appendChild(ring);
      setTimeout(function () {
        ring.remove();
      }, 650);
      slot.classList.add("bloomed");
      done++;
      window.spawnP(r.left + r.width / 2, r.top + 18, true);
      updateBar();
      if (done === N) {
        setTimeout(winGame, 1000);
        return;
      }
      setHint("🌸 " + done + "/" + N + " hoa nở rồi! Tiếp tục nào~");
    } else {
      // Chưa bloom: lắc lư wobble sau mỗi lần tưới
      svgEl.classList.add("wobble");
      setTimeout(function () {
        svgEl.classList.remove("wobble");
      }, 700);
      if (wLeft <= 0 && done < N) {
        setTimeout(loseGame, 350);
        return;
      }
      setHint("💧 Còn " + wLeft + " lần · " + done + "/" + N + " hoa");
    }
  }

  function updateBar() {
    document.getElementById("pFill").style.width = (done / N) * 100 + "%";
    document.getElementById("pTxt").textContent = done + " / " + N + " hoa";
  }
  function setHint(m) {
    document.getElementById("hint").textContent = m;
  }

  function loseGame() {
    over = true;
    document.getElementById("hint").innerHTML =
      '😢 Hết nước mất rồi! <button onclick="resetGame()" style="border:none;background:var(--pink);color:white;padding:4px 14px;border-radius:100px;cursor:pointer;font-weight:800;font-family:\'Nunito\',sans-serif;margin-left:6px">Thử lại 🔄</button>';
  }

  window.resetGame = function () {
    wLeft = TW;
    fw = Array(N).fill(0);
    done = 0;
    over = false;
    document.getElementById("wBadge").textContent = "💧 " + TW + " lần tưới";
    document.getElementById("pFill").style.width = "0%";
    document.getElementById("pTxt").textContent = "0 / " + N + " hoa";
    setHint("👆 Click vào chậu để tưới nước!");
    buildGarden();
  };

  function winGame() {
    for (var i = 0; i < 7; i++) {
      (function (delay) {
        setTimeout(function () {
          window.spawnP(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.5,
            true,
          );
        }, delay);
      })(i * 130);
    }

    if (window.stopGameMusic) window.stopGameMusic();

    var ov = document.getElementById("tr");
    ov.classList.add("on");
    setTimeout(function () {
      document.getElementById("gs").classList.add("off");
      document.getElementById("cs").classList.remove("off");
      ov.classList.remove("on");
      if (window.startCardMusic) window.startCardMusic();
    }, 2700);
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildGarden();
    var g = document.getElementById("garden");
    var curEl = document.getElementById("cursor");
    var canEl = document.getElementById("canCur");
    g.addEventListener("mouseenter", function () {
      canEl.style.opacity = "1";
      curEl.classList.add("wet");
    });
    g.addEventListener("mouseleave", function () {
      canEl.style.opacity = "0";
      curEl.classList.remove("wet");
    });
  });
})();
