/** @file Non-destructive presentation treatment; source attachments are never changed. */
export function clearLogoWhiteEdges(
  input: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const data = new Uint8ClampedArray(input),
    seen = new Uint8Array(width * height),
    queue = new Uint32Array(width * height);
  let head = 0,
    tail = 0;
  const add = (pixel: number) => {
    if (seen[pixel]) return;
    seen[pixel] = 1;
    const p = pixel * 4,
      r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    if (
      data[p + 3] < 8 ||
      (Math.min(r, g, b) >= 240 && Math.max(r, g, b) - Math.min(r, g, b) < 18)
    )
      queue[tail++] = pixel;
  };
  for (let x = 0; x < width; x++) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    add(y * width);
    add(y * width + width - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    data[i * 4 + 3] = 0;
    const x = i % width,
      y = Math.floor(i / width);
    if (x) add(i - 1);
    if (x + 1 < width) add(i + 1);
    if (y) add(i - width);
    if (y + 1 < height) add(i + width);
  }
  let left = width,
    top = height,
    right = -1,
    bottom = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  if (right < left)
    throw new Error(
      "O tratamento deixou a logo vazia. Use a apresentação original.",
    );
  return { data, left, top, width: right - left + 1, height: bottom - top + 1 };
}
export function proposalThemeStyle(theme: string) {
  return theme === "azure"
    ? {
        backgroundColor: "#080c12",
        backgroundImage:
          "radial-gradient(ellipse at 100% 0%, #123b79 0%, transparent 62%), radial-gradient(ellipse at 0% 100%, #102c4d 0%, transparent 60%)",
      }
    : { backgroundColor: "#080c12" };
}

export const proposalChannelColors = {
  whatsapp: "#16a65d",
  instagram: "#b32f86",
  youtube: "#e52125",
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  tiktok: "#111827",
  github: "#24292f",
  x: "#111827",
  email: "#285cbe",
  phone: "#21735a",
  website: "#285cbe",
  other: "#3b475d",
};
