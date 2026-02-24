export function injectCSS(css: string) {
  let tag = document.getElementById("theme") as HTMLStyleElement | null;

  if (!tag) {
    tag = document.createElement("style");
    tag.id = "theme";
    document.head.appendChild(tag);
  }

  tag.innerHTML = css;
}
