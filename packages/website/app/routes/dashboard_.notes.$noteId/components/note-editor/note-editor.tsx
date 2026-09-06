import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./note-editor.scss";

interface NoteEditorProps {
  content: string;
}

export function NoteEditor({ content }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write notes" }),
    ],
    content,
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} className="note-editor" />;
}
