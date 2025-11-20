import {
  Search,
  Mic,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  Smile,
  Image
} from 'lucide-react';

interface FormattingToolbarProps {
  onMicClick?: () => void;
}

export const FormattingToolbar = ({ onMicClick }: FormattingToolbarProps) => {
  const buttonClass = "p-2 hover:bg-blue-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="bg-blue-100 border-b-2 border-blue-200 px-4 py-3 flex items-center gap-2 flex-wrap">
      <button
        className={buttonClass}
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        onClick={onMicClick}
        className={buttonClass}
        aria-label="Voice input"
      >
        <Mic className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <div className="w-px h-6 bg-gray-400 mx-2" aria-hidden="true"></div>

      <button
        className={buttonClass}
        aria-label="Bold text"
      >
        <Bold className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Italic text"
      >
        <Italic className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Underline text"
      >
        <Underline className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Strikethrough text"
      >
        <Strikethrough className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <div className="w-px h-6 bg-gray-400 mx-2" aria-hidden="true"></div>

      <button
        className={buttonClass}
        aria-label="Align left"
      >
        <AlignLeft className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Align center"
      >
        <AlignCenter className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Align right"
      >
        <AlignRight className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <div className="w-px h-6 bg-gray-400 mx-2" aria-hidden="true"></div>

      <button
        className={buttonClass}
        aria-label="Insert link"
      >
        <Link className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Insert code"
      >
        <Code className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Insert emoji"
      >
        <Smile className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>

      <button
        className={buttonClass}
        aria-label="Insert image"
      >
        <Image className="w-5 h-5 text-gray-700" aria-hidden="true" />
      </button>
    </div>
  );
};
