// Markdoc для статей блогу (src/content/blog/<мова>/<slug>.mdoc).
// Власні блоки в тексті статті — ті самі, що в меню «Вставити» адмінки Keystatic (keystatic.config.ts).
import { defineMarkdocConfig, component, nodes } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  nodes: {
    // Без обгортки <article>: блоки тексту — прямі дочірні елементи сітки статті
    // (так split і «Key takeaway» можуть бути ширшими за колонку тексту)
    document: {
      ...nodes.document,
      render: null,
    },
    // Зображення в тексті: ![опис](шлях "підпис") — оптимізується Astro, підпис під зображенням
    image: {
      ...nodes.image,
      render: component('./src/components/blog/ProseImage.astro'),
    },
  },
  tags: {
    // «Текст + зображення»: {% split … %}абзаци{% /split %}
    split: {
      render: component('./src/components/blog/Split.astro'),
      attributes: {
        label: { type: String },
        title: { type: String, required: true },
        titleAccent: { type: String },
        // шлях до файлу в src/assets/img/… (Keystatic пише «/src/assets/img/blog/файл.jpg»)
        image: { type: String, required: true },
        imageAlt: { type: String },
        reverse: { type: Boolean, default: false },
      },
    },
    // Темна смуга «Key takeaway»: {% takeaway text="…" /%}
    takeaway: {
      render: component('./src/components/blog/Takeaway.astro'),
      selfClosing: true,
      attributes: {
        label: { type: String },
        text: { type: String, required: true },
        footnote: { type: String },
      },
    },
  },
});
