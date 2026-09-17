(() => {
  const letters = Array.isArray(window.REBECA_LETTERS) ? window.REBECA_LETTERS : [];
  const grid = document.querySelector("#letters-grid");
  const dialog = document.querySelector("#letter-dialog");
  const paper = document.querySelector("#letter-paper");
  const title = document.querySelector("#dialog-title");
  const body = document.querySelector("#dialog-body");
  const signoff = document.querySelector("#dialog-signoff");
  const closeButton = document.querySelector("#dialog-close");
  const backButton = document.querySelector("#back-to-letters");

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

    title.textContent = letter.when;
    signoff.textContent = letter.signoff || "Con todo mi amor";
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
  backButton.addEventListener("click", closeLetter);

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

(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const layer = document.createElement("div");
  layer.className = "heart-balloons";
  layer.setAttribute("aria-label", "Globos de corazón interactivos");

  const status = document.createElement("p");
  status.className = "visually-hidden";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  layer.append(status);
  hero.append(layer);

  const isCompact = window.matchMedia("(max-width: 700px)").matches;
  const slots = isCompact ? [4, 12, 88, 96] : [4, 11, 18, 82, 89, 96];
  const colors = ["#f06b83", "#df4568", "#bd2854", "#e85a75", "#a91f4b", "#ce365d"];

  function addBurstParticles(balloon) {
    const particleCount = 10;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.28;
      const distance = 34 + Math.random() * 34;

      particle.className = "heart-balloon__particle";
      particle.setAttribute("aria-hidden", "true");
      particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--particle-delay", `${Math.random() * 70}ms`);
      balloon.append(particle);
    }
  }

  function createBalloon(slotIndex) {
    const balloon = document.createElement("button");
    const heart = document.createElement("span");
    const string = document.createElement("span");
    const duration = 17 + Math.random() * 8;
    const size = (isCompact ? 2.8 : 3.1) + Math.random() * (isCompact ? 1.15 : 1.65);

    balloon.className = "heart-balloon";
    balloon.type = "button";
    balloon.dataset.slot = String(slotIndex);
    balloon.setAttribute("aria-label", "Explotar globo de corazón");
    balloon.title = "¡Pínchame!";
    balloon.style.setProperty("--balloon-x", `${slots[slotIndex]}%`);
    balloon.style.setProperty("--balloon-rest-y", `${12 + Math.random() * 72}vh`);
    balloon.style.setProperty("--balloon-size", `${size}rem`);
    balloon.style.setProperty("--balloon-color", colors[slotIndex % colors.length]);
    balloon.style.setProperty("--float-duration", `${duration}s`);
    balloon.style.setProperty("--float-delay", `${-Math.random() * duration}s`);
    balloon.style.setProperty("--sway-delay", `${-Math.random() * 4}s`);

    heart.className = "heart-balloon__heart";
    heart.setAttribute("aria-hidden", "true");
    heart.textContent = "♥";

    string.className = "heart-balloon__string";
    string.setAttribute("aria-hidden", "true");
    balloon.append(heart, string);

    balloon.addEventListener("click", (event) => {
      if (balloon.classList.contains("is-popping")) return;

      const usedKeyboard = event.detail === 0;
      balloon.classList.add("is-popping");
      balloon.setAttribute("aria-label", "Globo explotado");
      addBurstParticles(balloon);
      status.textContent = "";
      requestAnimationFrame(() => {
        status.textContent = "¡Pum! Has explotado un globo de corazón.";
      });

      window.setTimeout(() => {
        const nextBalloon = layer.querySelector(".heart-balloon:not(.is-popping)");
        balloon.remove();

        if (usedKeyboard) {
          (nextBalloon || document.querySelector(".primary-button"))?.focus({ preventScroll: true });
        }

        window.setTimeout(() => createBalloon(slotIndex), 900 + Math.random() * 900);
      }, 620);
    });

    layer.append(balloon);
  }

  slots.forEach((_, index) => createBalloon(index));
})();
