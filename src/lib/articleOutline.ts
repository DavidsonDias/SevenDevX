export interface ArticleHeading { id: string; title: string; level: 2 | 3 }
/** Mirrors remark line positions; ignores headings inside fenced code. */
export function articleOutline(markdown: string): ArticleHeading[] {
  const items: ArticleHeading[] = [];
  let fence: string | null = null;
  let fenceLength = 0;
  markdown.split(/\r?\n/).forEach((line, index) => {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) { fence = marker[1][0]; fenceLength = marker[1].length; }
      else if (marker[1][0] === fence && marker[1].length >= fenceLength) fence = null;
      return;
    }
    if (fence) return;
    const heading = /^ {0,3}(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) return;
    const title = heading[2].replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
    if (title) items.push({ id: `article-section-${index + 1}`, title, level: heading[1].length as 2 | 3 });
  });
  return items;
}
