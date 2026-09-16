const searchInput = document.querySelector("#certificate-search");
const results = document.querySelector("#results");
const searchHint = document.querySelector("#search-hint");
const noteDialog = document.querySelector("#teacher-note-dialog");
const noteDialogBody = document.querySelector("#note-dialog-body");
const noteDialogView = document.querySelector("#note-dialog-view");
const noteDialogClose = document.querySelector("#note-dialog-close");
const noteDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "long", year: "numeric"
}).format(new Date());

function batchLabel(certificate) {
  return [certificate.course, certificate.batch && `Batch ${certificate.batch}`]
    .filter(Boolean)
    .join(" · ");
}

function makeText(tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  return element;
}

function noteCard(certificate) {
  const message = noteFor(certificate);
  const section = document.createElement("section");
  section.className = "teacher-note-wrap";
  section.setAttribute("aria-label", `A note from your teacher for ${certificate.name}`);

  const card = document.createElement("div");
  card.className = "teacher-note";
  const title = makeText("h3", "note-title", "A Note From Your Teacher");
  title.id = "note-dialog-title";
  card.append(
    makeText("p", "note-kicker", "A personal letter"),
    title,
    makeText("p", "note-for", `For ${certificate.name}`)
  );

  const details = document.createElement("p");
  details.className = "note-details";
  details.append(
    makeText("span", "", batchLabel(certificate)),
    makeText("span", "", noteDate)
  );
  card.append(details);

  const letter = document.createElement("div");
  letter.className = "note-letter";
  letter.append(makeText("p", "note-greeting", message.greeting));
  message.paragraphs.forEach((paragraph) => letter.append(makeText("p", "", paragraph)));
  letter.append(makeText("p", "note-reminder", message.reminder));
  card.append(letter);

  const closing = document.createElement("div");
  closing.className = "note-closing";
  closing.append(
    makeText("p", "", message.signOff),
    makeText("p", "note-signature", message.signature)
  );
  card.append(closing);

  const controls = document.createElement("div");
  controls.className = "note-controls";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "save-note";
  save.textContent = "Keep this message saved 💙";
  const status = makeText("span", "note-status", "");
  status.setAttribute("role", "status");
  save.addEventListener("click", async () => {
    save.disabled = true;
    status.textContent = "Preparing your note…";
    try {
      await saveNotePng(certificate, message);
      status.textContent = "Your note is ready to keep.";
    } catch (error) {
      console.error("Could not save teacher note", error);
      status.textContent = "Could not save the note. Please try again.";
    } finally {
      save.disabled = false;
    }
  });
  controls.append(save, status);
  section.append(card, controls);
  return section;
}

function openNote(certificate, viewCertificate = false) {
  noteDialogBody.replaceChildren(noteCard(certificate));
  noteDialogView.hidden = !viewCertificate;
  noteDialogView.href = encodeURI(certificate.file);
  if (!noteDialog.open) noteDialog.showModal();
  noteDialog.scrollTop = 0;
}

noteDialogClose.addEventListener("click", () => noteDialog.close());
noteDialogView.addEventListener("click", () => noteDialog.close());
noteDialog.addEventListener("click", (event) => {
  if (event.target === noteDialog) noteDialog.close();
});

function wrapCanvasText(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function saveNotePng(certificate, message) {
  if (document.fonts) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  const width = 1200;
  const left = 108;
  const textWidth = width - left * 2;
  const serif = '"Playfair Display", Georgia, serif';
  const sans = '"DM Sans", Arial, sans-serif';

  function layout(draw, height = 0) {
    let y = 106;
    if (draw) {
      ctx.fillStyle = "#f8f3e9";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#cdbb92";
      ctx.lineWidth = 3;
      ctx.strokeRect(31, 31, width - 62, height - 62);
      ctx.strokeStyle = "#e2d5b9";
      ctx.lineWidth = 1;
      ctx.strokeRect(43, 43, width - 86, height - 86);
      ctx.fillStyle = "#ba9866";
      ctx.fillRect(left, 78, 80, 5);
    }
    ctx.textBaseline = "top";
    function lines(text, font, color, lineHeight, after = 0) {
      ctx.font = font;
      ctx.fillStyle = color;
      for (const line of wrapCanvasText(ctx, text, textWidth)) {
        if (draw) ctx.fillText(line, left, y);
        y += lineHeight;
      }
      y += after;
    }
    lines("A PERSONAL LETTER", `700 23px ${sans}`, "#866c48", 32, 19);
    lines("A Note From Your Teacher", `700 55px ${serif}`, "#233b4b", 73, 28);
    lines(`For ${certificate.name}`, `600 41px ${serif}`, "#233b4b", 58, 18);
    lines(`${batchLabel(certificate)}   •   ${noteDate}`, `600 24px ${sans}`, "#776b5b", 36, 37);
    if (draw) {
      ctx.fillStyle = "#cdbb92";
      ctx.fillRect(left, y, textWidth, 2);
    }
    y += 49;
    lines(message.greeting, `700 32px ${serif}`, "#253a45", 47, 21);
    for (const paragraph of message.paragraphs) {
      lines(paragraph, `400 30px ${sans}`, "#3b4547", 48, 24);
    }
    y += 6;
    lines(message.reminder, `700 34px ${serif}`, "#29475a", 51, 46);
    lines(message.signOff, `400 27px ${sans}`, "#5d5c54", 42, 8);
    lines(message.signature, `700 35px ${serif}`, "#29475a", 50);
    return y + 100;
  }

  const height = Math.ceil(layout(false));
  // Export at up to 2400px wide, while keeping long letters within a
  // mobile-friendly canvas size. PNG remains lossless at either size.
  const pixelRatio = Math.min(2, Math.sqrt(12_000_000 / (width * height)));
  canvas.width = Math.floor(width * pixelRatio);
  const exportScale = canvas.width / width;
  canvas.height = Math.ceil(height * exportScale);
  ctx.scale(exportScale, exportScale);
  layout(true, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG creation failed");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = certificate.recordLabel || certificate.name;
  link.download = `A-note-from-your-Teacher-to-${fileName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function normalise(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");
}

function resultCard(certificate) {
  const card = document.createElement("article");
  card.className = "result-card";

  const details = document.createElement("div");
  const name = document.createElement("h2");
  name.textContent = certificate.name;
  const metadata = document.createElement("p");
  metadata.className = "metadata";
  const fields = [
    ["Course", certificate.course],
    ["Batch", certificate.batch],
    ...(certificate.recordLabel ? [["Record", certificate.recordLabel]] : []),
    ...(certificate.fatherName
      ? [["Father’s name", certificate.fatherName]]
      : []),
  ];
  fields.forEach(([label, value]) => {
    const item = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = `${label}: `;
    item.append(title, value);
    metadata.append(item);
  });
  details.append(name, metadata);

  const actions = document.createElement("div");
  actions.className = "actions";
  const view = document.createElement("a");
  view.className = "button secondary";
  view.href = encodeURI(certificate.file);
  view.target = "_blank";
  view.rel = "noopener";
  view.textContent = "View certificate";
  view.addEventListener("click", (event) => {
    event.preventDefault();
    openNote(certificate, true);
  });
  const download = document.createElement("a");
  download.className = "button";
  download.href = encodeURI(certificate.file);
  download.download = "";
  download.textContent = "Download certificate";
  download.addEventListener("click", () => {
    // Let the browser start the original PDF download before showing the note.
    setTimeout(() => openNote(certificate), 0);
  });
  actions.append(view, download);
  card.append(details, actions);
  return card;
}

function emptyState() {
  const state = document.createElement("div");
  state.className = "empty-state";
  state.innerHTML = `<div class="empty-icon" aria-hidden="true">!</div>
  <h2>No certificate found.</h2>
  <p>Please <a href="https://wa.me/923033111499" target="_blank" id="management-contact">
  contact management </a> </p>`;
  return state;
}

function render() {
  const query = normalise(searchInput.value.trim());
  results.replaceChildren();

  if (!query) {
    searchHint.textContent = "Start typing to find your certificate.";
    return;
  }

  const matches = certificates.filter((certificate) =>
    [certificate.name, certificate.rollNo, certificate.fatherName, ...(certificate.searchNames || [])]
      .filter(Boolean)
      .some((value) => normalise(value).includes(query)),
  );

  if (!matches.length) {
    searchHint.textContent = "0 certificates found";
    results.append(emptyState());
    return;
  }

  searchHint.textContent = `${matches.length} certificate${matches.length === 1 ? "" : "s"} found`;
  matches.forEach((certificate) => results.append(resultCard(certificate)));
}

function restoreSearchFromUrl() {
  searchInput.value = new URL(window.location.href).searchParams.get("q") || "";
  render();
}

searchInput.addEventListener("input", () => {
  const url = new URL(window.location.href);
  const query = searchInput.value.trim();

  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }

  window.history.replaceState(window.history.state, "", url);
  render();
});

window.addEventListener("popstate", restoreSearchFromUrl);
restoreSearchFromUrl();
