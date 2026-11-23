import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ content }: { content: string }) {
  return (
    <div className="chat-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          // Las fuentes navegables las genera el backend a partir de juegos reales.
          // Los enlaces e imágenes libres del modelo no se convierten en navegación.
          a: ({ children }) => <span>{children}</span>,
          img: () => null,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
