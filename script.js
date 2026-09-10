const searchInput = document.querySelector("#certificate-search");
const results = document.querySelector("#results");
const searchHint = document.querySelector("#search-hint");

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
    ["Roll no ", "----"],
    ["Course", certificate.course],
    ["Batch", certificate.batch],
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
  const download = document.createElement("a");
  download.className = "button";
  download.href = encodeURI(certificate.file);
  download.download = "";
  download.textContent = "Download PDF";
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
    [certificate.name, certificate.rollNo, certificate.fatherName]
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
