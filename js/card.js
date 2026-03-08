/**
 * Tương tác thiệp:
 *  - Click vào cover → fold open (add class card-open)
 *  - Nút "Gửi yêu thương", click hoa SVG trong card
 */
(function () {
  // ── Fold open on cover click ──────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    var cover = document.getElementById("cardCover");
    var card = document.getElementById("greetingCard");

    if (cover && card) {
      cover.addEventListener("click", function (e) {
        if (card.classList.contains("card-open")) return;

        // Hiệu ứng hoa bung ra khi mở thiệp
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        for (var i = 0; i < 5; i++) {
          (function (j) {
            setTimeout(function () {
              if (window.spawnP) window.spawnP(cx, cy, true);
            }, j * 80);
          })(i);
        }

        cover.style.opacity = "0";
        setTimeout(function () {
          cover.style.display = "none";
        }, 150);
        card.classList.add("card-open");
      });
    }
  });

  // ── Gửi yêu thương / Mở món quà ─────────────────────────────────
  window.sendHeart = function () {
    var btn = document.querySelector(".ci-send-btn");
    if (btn && btn.classList.contains("sent")) return;
    if (btn) {
      btn.classList.add("sent");
      setTimeout(function() {
        btn.querySelector("span:last-child").textContent = "Đã gửi yêu thương rồi nha!";
      }, 1000);
    }

    // Hiệu ứng hoa bung ra khi ấn Mở món quà
    var card = document.getElementById("greetingCard");
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    if (card) {
      var rect = card.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }
    [0, 80, 160, 240, 320].forEach(function (t) {
      setTimeout(function () {
        if (window.spawnP) window.spawnP(cx, cy, true);
      }, t);
    });

    var toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(function () { toast.classList.remove("show"); }, 1000);
    }

    // Hiện popup mèo sau khi gửi
    setTimeout(function () {
      var overlay = document.getElementById("catOverlay");
      if (overlay) overlay.classList.add("show");
    }, 500);
  };

  // ── Đóng popup mèo ───────────────────────────────────────────────
  window.closeCat = function (e) {
    var overlay = document.getElementById("catOverlay");
    if (!overlay) return;
    if (e && e.target && e.target !== overlay) return;
    overlay.classList.remove("show");
  };

  // ── Event delegation cho .ci-corner ─────────────────────────────
  document.getElementById("cs").addEventListener("click", function (e) {
    var corner = e.target.closest(".ci-corner");
    if (corner) {
      e.stopPropagation();
      window.spawnP(e.clientX, e.clientY, true);
    }
  });
})();
