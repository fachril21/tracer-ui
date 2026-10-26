type OriginResult = { ok: true; value: string } | { ok: false; error: string };

// Origin = skema + host + port, tanpa path. Diketik bebas, disimpan dalam bentuk baku.
function parseOrigin(input: string, existing: string[]): OriginResult {
  const text = input.trim();
  if (text === "") return { ok: false, error: "Isi origin terlebih dahulu." };
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, error: "Awali dengan https://, misalnya https://contoh.id." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "Hanya http:// dan https:// yang didukung." };
  }
  if (url.pathname !== "/" || url.search !== "" || url.hash !== "") {
    return { ok: false, error: "Tulis origin saja, tanpa path. Contoh: https://contoh.id." };
  }
  if (existing.includes(url.origin)) {
    return { ok: false, error: "Origin ini sudah terdaftar." };
  }
  return { ok: true, value: url.origin };
}

export { parseOrigin };
