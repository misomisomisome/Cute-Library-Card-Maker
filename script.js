// ============================================
// Library Card Maker — script.js
//
// SECURITY NOTES (read this before extending it):
// 1. Every piece of typed/pasted text is written using
//    `textContent`, never `innerHTML`. That means even if
//    someone pastes `<script>...</script>` into a field, it
//    is displayed as literal text on the card, not executed.
// 2. No eval(), no Function(), no dynamic script injection.
// 3. The only network calls this page makes are the Google
//    Fonts stylesheet and the html2canvas library, both loaded
//    once from their official CDNs in index.html. No user data
//    is ever sent anywhere — everything happens in your browser.
// 4. Inputs use maxlength attributes so a very long paste can't
//    break the card's fixed layout.
// ============================================

(function () {
  const form = document.getElementById("card-form");
  const inputAuthor = document.getElementById("input-author");
  const inputTitle = document.getElementById("input-title");
  const inputDate = document.getElementById("input-date");
  const inputQuote = document.getElementById("input-quote");

  const outAuthor = document.getElementById("out-author");
  const outTitle = document.getElementById("out-title");
  const outDate = document.getElementById("out-date");
  const outQuote = document.getElementById("out-quote");

  const card = document.getElementById("library-card");
  const btnDownload = document.getElementById("btn-download");
  const btnPrint = document.getElementById("btn-print");
  const btnReset = document.getElementById("btn-reset");

  const DEFAULTS = {
    author: "",
    title: "",
    date: "",
    quote: "Between\nthe pages\nof a book\nis a lovely\nplace to be.",
  };

  /** Writes plain text safely — never parsed as HTML. */
  function setText(el, value) {
    el.textContent = value;
  }

  /** Renders the multi-line quote as separate text nodes joined by <br>,
   *  built with DOM APIs (not string concatenation + innerHTML) so
   *  nothing in the text can ever be interpreted as markup. */
  function setQuote(el, value) {
    el.textContent = "";
    const lines = value.split("\n");
    lines.forEach((line, i) => {
      el.appendChild(document.createTextNode(line));
      if (i < lines.length - 1) {
        el.appendChild(document.createElement("br"));
      }
    });
  }

  /** Restarts the card's CSS reveal animations by forcing reflow. */
  function replayAnimations() {
    card.style.animation = "none";
    outQuote.style.animation = "none";
    document.querySelectorAll(".heart").forEach((h) => (h.style.animation = "none"));
    document.querySelector(".flourish").style.animation = "none";

    // Force reflow so the browser "forgets" the animation ran
    void card.offsetWidth;

    card.style.animation = "";
    outQuote.style.animation = "";
    document.querySelectorAll(".heart").forEach((h) => (h.style.animation = ""));
    document.querySelector(".flourish").style.animation = "";
  }

  function updateCard() {
    setText(outAuthor, inputAuthor.value);
    setText(outTitle, inputTitle.value);
    setText(outDate, inputDate.value);
    setQuote(outQuote, inputQuote.value);
    replayAnimations();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    updateCard();
  });

  btnReset.addEventListener("click", () => {
    inputAuthor.value = DEFAULTS.author;
    inputTitle.value = DEFAULTS.title;
    inputDate.value = DEFAULTS.date;
    inputQuote.value = DEFAULTS.quote;
    updateCard();
  });

  btnPrint.addEventListener("click", () => {
    window.print();
  });

  btnDownload.addEventListener("click", () => {
    if (typeof html2canvas === "undefined") {
      alert("Couldn't load the image export library — check your internet connection and try again.");
      return;
    }
    btnDownload.disabled = true;
    btnDownload.textContent = "Preparing…";
    html2canvas(card, { backgroundColor: null, scale: 2 })
      .then((canvas) => {
        const link = document.createElement("a");
        const filenameSafe = (inputTitle.value || "library-card")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        link.download = `${filenameSafe || "library-card"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch(() => {
        alert("Something went wrong creating the image. Try Print instead.");
      })
      .finally(() => {
        btnDownload.disabled = false;
        btnDownload.textContent = "Download as Image";
      });
  });

  // Initial render on page load
  updateCard();
})();
