/**
 * Cursor tùy chỉnh + canvas particle (emoji).
 * Expose window.spawnP() để game và card dùng.
 * Tối ưu: giới hạn particle, GPU compositing, tắt cursor trên touch.
 */
(function () {
  var isTouchDevice = navigator.maxTouchPoints > 0;
  var curEl = document.getElementById("cursor");
  var canEl = document.getElementById("canCur");

  // Trên touch device: ẩn cursor tuỳ chỉnh để tiết kiệm tài nguyên
  if (isTouchDevice) {
    curEl.style.display = "none";
    canEl.style.display = "none";
  } else {
    document.addEventListener("mousemove", function (e) {
      curEl.style.left = e.clientX + "px";
      curEl.style.top = e.clientY + "px";
      canEl.style.left = e.clientX + "px";
      canEl.style.top = e.clientY + "px";
    });
  }

  var bgc = document.getElementById("bgc");
  var ctx = bgc.getContext("2d", { willReadFrequently: false });
  // Force GPU compositing layer
  bgc.style.transform = "translateZ(0)";

  var rsz = function () {
    bgc.width = window.innerWidth;
    bgc.height = window.innerHeight;
  };
  rsz();
  window.addEventListener("resize", rsz);

  var EM = ["🌸", "💕", "✨", "🌷", "💖", "🌺", "⭐", "💗", "🎀", "🌼"];
  var pts = [];
  var MAX_PARTICLES = 80; // Giới hạn để tránh lag

  function spawnP(x, y, burst) {
    var n = burst ? 10 : 1; // burst từ 15 → 10 để tối ưu
    if (!burst && pts.length >= MAX_PARTICLES) return;
    var toSpawn = Math.min(n, MAX_PARTICLES - pts.length);
    for (var i = 0; i < toSpawn; i++) {
      pts.push({
        x: x != null ? x : Math.random() * bgc.width,
        y: y != null ? y : -18,
        e: EM[~~(Math.random() * EM.length)],
        sz: burst ? 16 + Math.random() * 14 : 13 + Math.random() * 12,
        vx: burst ? (Math.random() - 0.5) * 9 : (Math.random() - 0.5) * 1.4,
        vy: burst ? -4.5 - Math.random() * 5.5 : 1.4 + Math.random() * 1.8,
        g: burst ? 0.22 : 0,
        op: 1,
        r: Math.random() * 360,
        rs: (Math.random() - 0.5) * 4,
        life: burst ? 110 : 265,
        ml: burst ? 110 : 265,
      });
    }
  }

  window.spawnP = spawnP;

  // Ambient spawn giảm từ 430ms → 750ms để bớt lag
  setInterval(function () {
    spawnP();
  }, 750);

  (function tick() {
    ctx.clearRect(0, 0, bgc.width, bgc.height);
    for (var i = pts.length - 1; i >= 0; i--) {
      var p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.r += p.rs;
      p.life--;
      p.op = p.life / p.ml;
      ctx.save();
      ctx.globalAlpha = p.op;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.r * Math.PI) / 180);
      ctx.font = p.sz + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.e, 0, 0);
      ctx.restore();
      if (p.life <= 0 || p.y > bgc.height + 30) pts.splice(i, 1);
    }
    requestAnimationFrame(tick);
  })();

  // Click để spawn particle, bỏ qua .pslot, .ci-send-btn, .mbtn, .ci-corner
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".pslot") &&
      !e.target.closest(".ci-send-btn") &&
      !e.target.closest(".mbtn") &&
      !e.target.closest(".ci-corner")
    ) {
      spawnP(e.clientX, e.clientY, true);
    }
  });
})();
