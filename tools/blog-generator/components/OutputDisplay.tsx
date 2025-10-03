import React, { useState, useEffect } from 'react';
import { SupabasePayload } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CodeIcon } from './icons/CodeIcon';

interface OutputDisplayProps {
  markdownContent: string;
  supabasePayload: SupabasePayload | null;
  isLoading: boolean;
  error: string | null;
}

type ActiveTab = 'markdown' | 'json';

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-brand-accent rounded w-3/4"></div>
    <div className="h-4 bg-brand-accent rounded"></div>
    <div className="h-4 bg-brand-accent rounded"></div>
    <div className="h-4 bg-brand-accent rounded w-5/6"></div>
    <div className="h-4 bg-brand-accent rounded w-1/2 mt-6"></div>
    <div className="h-4 bg-brand-accent rounded"></div>
    <div className="h-4 bg-brand-accent rounded w-4/5"></div>
  </div>
);

const CopyButton: React.FC<{ onCopy: () => void; text: string; copiedText: string; Icon: React.FC }> = ({ onCopy, text, copiedText, Icon }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleClick = () => {
    onCopy();
    setCopied(true);
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-2 text-sm bg-brand-accent hover:bg-brand-light/20 text-brand-light font-semibold py-1.5 px-3 rounded-md transition-all"
    >
      {copied ? <CheckIcon /> : <Icon />}
      {copied ? copiedText : text}
    </button>
  );
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ markdownContent, supabasePayload, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('markdown');

  const formattedJson = supabasePayload ? JSON.stringify(supabasePayload, null, 2) : '';

  const curlCommand = supabasePayload 
    ? `curl -X POST https://<PROJECT>.supabase.co/rest/v1/posts \\\n` +
      `  -H "apikey: <SUPABASE_SERVICE_ROLE>" \\\n` +
      `  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE>" \\\n` +
      `  -H "Content-Type: application/json" \\\n` +
      `  -H "Prefer: resolution=merge-duplicates" \\\n` +
      `  -d '${JSON.stringify(supabasePayload)}'`
    : '';

  return (
    <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 flex flex-col h-full min-h-[50vh] lg:min-h-0">
      <div className="flex justify-between items-start mb-4 border-b border-brand-accent/50">
        <div className="flex gap-1 -mb-px">
          <TabButton name="Markdown" id="markdown" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton name="Supabase JSON" id="json" activeTab={activeTab} setActiveTab={setActiveTab} disabled={!supabasePayload} />
        </div>
        <div className="flex gap-2">
            {activeTab === 'markdown' && markdownContent && (
                <CopyButton onCopy={() => navigator.clipboard.writeText(markdownContent)} text="Copy Markdown" copiedText="Copied!" Icon={CopyIcon}/>
            )}
            {activeTab === 'json' && supabasePayload && (
                <>
                    <CopyButton onCopy={() => navigator.clipboard.writeText(formattedJson)} text="Copy JSON" copiedText="Copied!" Icon={CopyIcon} />
                    <CopyButton onCopy={() => navigator.clipboard.writeText(curlCommand)} text="Copy cURL" copiedText="Copied!" Icon={CodeIcon} />
                </>
            )}
        </div>
      </div>

      <div className="prose prose-invert prose-p:text-brand-text prose-headings:text-brand-text prose-strong:text-brand-cyan prose-a:text-brand-cyan prose-blockquote:border-brand-accent bg-brand-primary p-4 rounded-md flex-grow overflow-auto">
        {isLoading && <SkeletonLoader />}
        {error && <div className="text-red-400"><strong className="font-bold">Error:</strong> {error}</div>}
        
        {!isLoading && !error && (
          <>
            {activeTab === 'markdown' && !markdownContent && <Placeholder text="Your generated blog post will appear here." />}
            {activeTab === 'json' && !supabasePayload && <Placeholder text="Generate a post to see the Supabase JSON payload." />}

            {activeTab === 'markdown' && markdownContent && <pre className="whitespace-pre-wrap break-words font-sans text-base leading-relaxed">{markdownContent}</pre>}
            {activeTab === 'json' && supabasePayload && (
                <div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">{formattedJson}</pre>
                    <p className="text-xs text-brand-light mt-4 p-2 bg-brand-secondary rounded-md">
                        Paste this JSON into Supabase (or run the cURL command) to create the draft post.
                    </p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ name: string; id: ActiveTab; activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void; disabled?: boolean }> = ({ name, id, activeTab, setActiveTab, disabled }) => (
  <button
    onClick={() => !disabled && setActiveTab(id)}
    disabled={disabled}
    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
      activeTab === id
        ? 'bg-brand-primary text-brand-cyan border-b-2 border-brand-cyan'
        : 'text-brand-light hover:bg-brand-accent/20'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {name}
  </button>
);

const Placeholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center h-full text-brand-light">{text}</div>
);
