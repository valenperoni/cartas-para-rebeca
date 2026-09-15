(() => {
  const letters = Array.isArray(window.REBECA_LETTERS) ? window.REBECA_LETTERS : [];
  const grid = document.querySelector("#letters-grid");
  const dialog = document.querySelector("#letter-dialog");
  const paper = document.querySelector("#letter-paper");
  const title = document.querySelector("#dialog-title");
  const body = document.querySelector("#dialog-body");
  const signoff = document.querySelector("#dialog-signoff");
  const position = document.querySelector("#letter-position");
  const closeButton = document.querySelector("#dialog-close");
  const previousButton = document.querySelector("#previous-letter");
  const nextButton = document.querySelector("#next-letter");

  let currentIndex = 0;
  let lastTrigger = null;
  let closeTimer = null;

  function createCard(letter, index) {
    const button = document.createElement("button");
    button.className = "letter-card";
    button.type = "button";
    button.style.setProperty("--accent", letter.accent || "#8e244b");
    button.style.setProperty("--delay", `${Math.min(index * 55, 330)}ms`);
    button.setAttribute("aria-label", `Abrir carta: cuando ${letter.when}`);

    const number = document.createElement("span");
    number.className = "letter-card__number";
    number.textContent = String(index + 1).padStart(2, "0");

    const envelope = document.createElement("span");
    envelope.className = "envelope";
    envelope.setAttribute("aria-hidden", "true");
    envelope.innerHTML = `
      <span class="envelope__back"></span>
      <span class="envelope__letter"></span>
      <span class="envelope__front"></span>
      <span class="envelope__flap"></span>
      <span class="envelope__seal">♥</span>
    `;

    const prompt = document.createElement("span");
    prompt.className = "letter-card__prompt";
    const small = document.createElement("span");
    small.textContent = "Ábrela cuando";
    const strong = document.createElement("strong");
    strong.textContent = letter.when;
    prompt.append(small, strong);

    const action = document.createElement("span");
    action.className = "letter-card__action";
    action.innerHTML = "Abrir carta <span aria-hidden=\"true\">↗</span>";

    button.append(number, envelope, prompt, action);
    button.addEventListener("click", () => openLetter(index, button));
    return button;
  }

  function renderLetter(index) {
    const letter = letters[index];
    if (!letter) return;

    currentIndex = index;
    title.textContent = letter.when;
    signoff.textContent = letter.signoff || "Con todo mi amor";
    position.textContent = `Carta ${index + 1} de ${letters.length}`;
    paper.style.setProperty("--letter-accent", letter.accent || "#8e244b");
    body.replaceChildren();

    (letter.body || []).forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      body.append(element);
    });
  }

  function openLetter(index, trigger) {
    window.clearTimeout(closeTimer);
    lastTrigger = trigger || lastTrigger;
    renderLetter(index);

    if (!dialog.open) dialog.showModal();
    dialog.classList.remove("is-visible");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dialog.classList.add("is-visible");
        paper.focus({ preventScroll: true });
      });
    });
    document.body.classList.add("dialog-open");
  }

  function closeLetter() {
    dialog.classList.remove("is-visible");
    closeTimer = window.setTimeout(() => {
      if (dialog.open) dialog.close();
    }, 230);
  }

  letters.forEach((letter, index) => grid.append(createCard(letter, index)));

  closeButton.addEventListener("click", closeLetter);
  previousButton.addEventListener("click", () => {
    const nextIndex = (currentIndex - 1 + letters.length) % letters.length;
    renderLetter(nextIndex);
    paper.scrollTop = 0;
  });
  nextButton.addEventListener("click", () => {
    const nextIndex = (currentIndex + 1) % letters.length;
    renderLetter(nextIndex);
    paper.scrollTop = 0;
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLetter();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeLetter();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });

  if (!("IntersectionObserver" in window)) {
    document.documentElement.classList.add("cards-visible");
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      document.documentElement.classList.add("cards-visible");
      observer.disconnect();
    },
    { threshold: 0.12 }
  );
  observer.observe(grid);
})();
