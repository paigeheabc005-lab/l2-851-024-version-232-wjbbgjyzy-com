(function () {
  var mobileButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .trim();
  }

  function applyFilters(panel) {
    var root = panel.closest("section") || document;
    var cards = Array.prototype.slice.call(
      root.querySelectorAll(".movie-card"),
    );
    var query = normalizeText(
      panel.querySelector(".movie-search-input") &&
        panel.querySelector(".movie-search-input").value,
    );
    var year = normalizeText(
      panel.querySelector(".movie-year-select") &&
        panel.querySelector(".movie-year-select").value,
    );
    var type = normalizeText(
      panel.querySelector(".movie-type-select") &&
        panel.querySelector(".movie-type-select").value,
    );
    var region = normalizeText(
      panel.querySelector(".movie-region-select") &&
        panel.querySelector(".movie-region-select").value,
    );

    cards.forEach(function (card) {
      var search = normalizeText(card.getAttribute("data-search"));
      var cardYear = normalizeText(card.getAttribute("data-year"));
      var cardType = normalizeText(card.getAttribute("data-type"));
      var cardRegion = normalizeText(card.getAttribute("data-region"));
      var matched = true;

      if (query && search.indexOf(query) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      card.classList.toggle("hidden-card", !matched);
    });
  }

  Array.prototype.slice
    .call(document.querySelectorAll("[data-filter-panel]"))
    .forEach(function (panel) {
      var controls = Array.prototype.slice.call(
        panel.querySelectorAll("input, select"),
      );
      var params = new URLSearchParams(window.location.search);
      var queryInput = panel.querySelector(".movie-search-input");

      if (queryInput && params.get("q")) {
        queryInput.value = params.get("q");
      }

      controls.forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilters(panel);
        });

        control.addEventListener("change", function () {
          applyFilters(panel);
        });
      });

      applyFilters(panel);
    });

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var mask = document.querySelector(".play-mask");
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function beginPlayback() {
      attachStream();

      if (mask) {
        mask.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (mask) {
            mask.classList.remove("is-hidden");
          }
        });
      }
    }

    if (mask) {
      mask.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (mask) {
        mask.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (mask) {
        mask.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
