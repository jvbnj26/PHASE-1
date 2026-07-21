import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered, Quote,
  LinkIcon, Unlink, AlignLeft, AlignCenter, AlignRight, Undo, Redo,
  Palette, Highlighter,
} from 'lucide-react';

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Gray', value: '#6b7280' },
  { label: 'Saffron', value: 'hsl(18 100% 50%)' },
  { label: 'Forest Green', value: 'hsl(120 35% 25%)' },
  { label: 'Golden Yellow', value: 'hsl(45 100% 51%)' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Blue', value: '#2563eb' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Blue', value: '#bfdbfe' },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? 'secondary' : 'ghost'}
      className="h-8 w-8"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

function ColorSwatches({
  colors,
  onPick,
}: {
  colors: { label: string; value: string }[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 p-1">
      {colors.map((c) => (
        <button
          key={c.label}
          type="button"
          title={c.label}
          onClick={() => onPick(c.value)}
          className="w-7 h-7 rounded-full border shadow-sm flex items-center justify-center"
          style={{ background: c.value || 'transparent' }}
        >
          {!c.value && <span className="text-[9px] text-muted-foreground">—</span>}
        </button>
      ))}
    </div>
  );
}

const HEADING_STYLES: { label: string; level: 0 | 2 | 3 | 4 }[] = [
  { label: 'Normal text', level: 0 },
  { label: 'Title', level: 2 },
  { label: 'Heading', level: 3 },
  { label: 'Subheading', level: 4 },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Write something…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[140px] px-3 py-2 prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const currentHeadingLevel = ([2, 3, 4] as const).find((l) => editor.isActive('heading', { level: l })) ?? 0;

  function setHeading(level: 0 | 2 | 3 | 4) {
    if (level === 0) editor!.chain().focus().setParagraph().run();
    else editor!.chain().focus().toggleHeading({ level }).run();
  }

  function applyLink() {
    if (!linkUrl.trim()) {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
      editor!.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkOpen(false);
    setLinkUrl('');
  }

  return (
    <div className="border rounded-md bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-muted/40 rounded-t-md">
        <Select value={String(currentHeadingLevel)} onValueChange={(v) => setHeading(Number(v) as 0 | 2 | 3 | 4)}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {HEADING_STYLES.map((h) => (
              <SelectItem key={h.level} value={String(h.level)}>{h.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton title="Text color" onClick={() => {}}>
              <Palette className="w-4 h-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <ColorSwatches
              colors={TEXT_COLORS}
              onPick={(v) => {
                if (v) editor.chain().focus().setColor(v).run();
                else editor.chain().focus().unsetColor().run();
              }}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton title="Highlight" active={editor.isActive('highlight')} onClick={() => {}}>
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <ColorSwatches
              colors={HIGHLIGHT_COLORS}
              onPick={(v) => {
                if (v) editor.chain().focus().setHighlight({ color: v }).run();
                else editor.chain().focus().unsetHighlight().run();
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <Popover open={linkOpen} onOpenChange={(o) => { setLinkOpen(o); if (o) setLinkUrl(editor.getAttributes('link').href || ''); }}>
          <PopoverTrigger asChild>
            <ToolbarButton title="Add link" active={editor.isActive('link')} onClick={() => {}}>
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-2">
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={applyLink}>Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
        {editor.isActive('link') && (
          <ToolbarButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
        )}

        <div className="flex-1" />

        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
