import katex from "katex";

interface Props {
  text?: string | null;
  className?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("\n", "<br/>");
}

function renderMathSegment(segment: string): string {
  const isBlock = segment.startsWith("$$") || segment.startsWith("\\[");
  const expr = segment.startsWith("$$")
    ? segment.slice(2, -2)
    : segment.startsWith("\\[")
      ? segment.slice(2, -2)
      : segment.startsWith("$")
        ? segment.slice(1, -1)
        : segment.slice(2, -2);

  const html = katex.renderToString(expr, {
    throwOnError: false,
    displayMode: isBlock,
    strict: "ignore",
  });

  return isBlock ? `<div class=\"math-block\">${html}</div>` : html;
}

export default function MathText({ text, className }: Props) {
  const raw = text ?? "";
  const pattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g;

  let html = "";
  let cursor = 0;

  raw.replace(pattern, (match, _p1, offset) => {
    const before = raw.slice(cursor, offset as number);
    html += escapeHtml(before);
    html += renderMathSegment(match);
    cursor = (offset as number) + match.length;
    return match;
  });

  html += escapeHtml(raw.slice(cursor));

  if (!html.trim()) {
    html = "설명이 없습니다.";
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

