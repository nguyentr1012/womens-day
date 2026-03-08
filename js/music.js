/**
 * Nhạc nền: game (PvZ2 loop), postcard (La Vie En Rose loop).
 * Loading/transition (#tr) không có nhạc.
 * Nút: id="mBtn", class mbtn, playing class "playing".
 */
(function () {
  var gameAudio = new Audio("music/Main Menu - Plants vs. Zombies 2.mp3");
  var cardAudio = new Audio("music/La Vie En Rose - Edith piaf (piano cover).mp3");
  gameAudio.loop = true;
  cardAudio.loop = true;

  var currentTrack = null; // 'game' | 'card'
  var autoStarted = false;

  function getBtn() {
    return document.getElementById("mBtn");
  }

  function setPlaying(playing) {
    var b = getBtn();
    if (!b) return;
    if (playing) {
      b.textContent = "🔇";
      b.classList.add("playing");
    } else {
      b.textContent = "🎵";
      b.classList.remove("playing");
    }
  }

  window.startGameMusic = function () {
    cardAudio.pause();
    cardAudio.currentTime = 0;
    gameAudio.play().catch(function () {});
    currentTrack = "game";
    setPlaying(true);
  };

  window.stopGameMusic = function () {
    gameAudio.pause();
    gameAudio.currentTime = 0;
    if (currentTrack === "game") currentTrack = null;
    setPlaying(currentTrack !== null);
  };

  window.startCardMusic = function () {
    gameAudio.pause();
    gameAudio.currentTime = 0;
    cardAudio.play().catch(function () {});
    currentTrack = "card";
    setPlaying(true);
  };

  window.stopCardMusic = function () {
    cardAudio.pause();
    cardAudio.currentTime = 0;
    if (currentTrack === "card") currentTrack = null;
    setPlaying(currentTrack !== null);
  };

  window.toggleMusic = function () {
    if (currentTrack === "game") {
      if (!gameAudio.paused) {
        gameAudio.pause();
        setPlaying(false);
      } else {
        gameAudio.play().catch(function () {});
        setPlaying(true);
      }
    } else if (currentTrack === "card") {
      if (!cardAudio.paused) {
        cardAudio.pause();
        setPlaying(false);
      } else {
        cardAudio.play().catch(function () {});
        setPlaying(true);
      }
    } else {
      // Chưa có track nào: bật nhạc game (đang ở màn game)
      startGameMusic();
    }
  };

  function onFirstInteraction() {
    if (autoStarted) return;
    autoStarted = true;
    document.removeEventListener("click", onFirstInteraction);
    document.removeEventListener("touchstart", onFirstInteraction);
    startGameMusic();
  }

  // Thử phát nhạc ngay khi load (nhiều trình duyệt chặn cho đến khi có tương tác)
  function tryAutoPlay() {
    window.startGameMusic();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryAutoPlay);
  } else {
    tryAutoPlay();
  }

  // Bật nhạc ngay ở lần chạm/click đầu tiên (dùng capture để chạy trước mọi thứ)
  document.addEventListener("click", onFirstInteraction, true);
  document.addEventListener("touchstart", onFirstInteraction, true);
})();
