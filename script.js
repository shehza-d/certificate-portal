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
    .join(" • ");
}

function noteMetaLabel(certificate) {
  return [batchLabel(certificate), noteDate].filter(Boolean).join(" • ");
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
    makeText("p", "note-for", `Dear Student ${certificate.name} ✨`)
  );

  const details = document.createElement("p");
  details.className = "note-details";
  details.append(makeText("span", "", noteMetaLabel(certificate)));
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
  // The downloaded keepsake uses a wider page than the on-screen card so
  // long letters remain comfortable to read without becoming extremely tall.
  const width = 1200;
  const left = 70;
  const textWidth = width - left * 2;
  const serif = '"Playfair Display", Georgia, serif';
  const sans = '"DM Sans", Arial, sans-serif';

  function layout(draw, height = 0) {
    let y = 68;
    if (draw) {
      ctx.fillStyle = "#f8f3e9";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#cdbb92";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, width - 40, height - 40);
      ctx.strokeStyle = "#e2d5b9";
      ctx.lineWidth = 1;
      ctx.strokeRect(29, 29, width - 58, height - 58);
      ctx.fillStyle = "#ba9866";
      ctx.fillRect(left, 50, 72, 4);
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
    lines("A PERSONAL LETTER", `700 19px ${sans}`, "#866c48", 24, 9);
    lines("A Note From Your Teacher", `700 44px ${serif}`, "#233b4b", 53, 13);
    lines(`Dear Student ${certificate.name} ✨`, `600 32px ${serif}`, "#233b4b", 40, 8);
    lines(noteMetaLabel(certificate), `600 20px ${sans}`, "#776b5b", 26, 19);
    if (draw) {
      ctx.fillStyle = "#cdbb92";
      ctx.fillRect(left, y, textWidth, 2);
    }
    y += 26;
    for (const paragraph of message.paragraphs) {
      lines(paragraph, `400 24px ${sans}`, "#3b4547", 32, 10);
    }
    y += 2;
    lines(message.reminder, `700 28px ${serif}`, "#29475a", 36, 19);
    lines(message.signOff, `400 23px ${sans}`, "#5d5c54", 31, 4);
    lines(message.signature, `700 28px ${serif}`, "#29475a", 36);
    return y + 56;
  }

  const height = Math.ceil(layout(false));
  // Export at 2400px wide when possible. Very long letters scale only as
  // needed to stay within a broadly supported canvas size. PNG is lossless.
  const pixelRatio = Math.min(4 / 3, Math.sqrt(20_000_000 / (width * height)));
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
