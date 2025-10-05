import React, { useState, useCallback } from 'react';
import { BlogInput, SupabasePayload } from './types';
import { generateBlogPost } from './services/geminiService';
import { Header } from './components/Header';
import { InputForm, CsvLoader } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [blogInput, setBlogInput] = useState<BlogInput>({
    title: 'The Rise of AI-Powered Phishing in Crypto',
    category: 'Security',
    keywords: 'AI-powered phishing, crypto security, phishing attacks, wallet protection, deepfake scams',
    summary: 'An analysis of how attackers are leveraging sophisticated AI tools to create more convincing phishing attacks targeting cryptocurrency users and how to defend against them.',
    slug: 'the-rise-of-ai-powered-phishing-in-crypto',
    publishDate: new Date().toISOString().split('T')[0],
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [supabasePayload, setSupabasePayload] = useState<SupabasePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleGenerate = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setGeneratedContent('');
    setSupabasePayload(null);

    try {
      const content = await generateBlogPost(blogInput);
      setGeneratedContent(content);

      if (content && !content.startsWith('MISSING DATA')) {
        const now = new Date().toISOString();
        const providedSlug = blogInput.slug?.trim();
        const finalSlug = providedSlug && providedSlug.length > 0 ? generateSlug(providedSlug) : generateSlug(blogInput.title);
        const publishAt = blogInput.publishDate ? new Date(blogInput.publishDate).toISOString() : null;
        
        // Use publishDate for idempotency key if available, otherwise use today's date
        const effectiveDateForIdempotency = blogInput.publishDate || new Date().toISOString().split('T')[0];

        const payload: SupabasePayload = {
            idempotency_key: blogInput.idempotency_key || `${effectiveDateForIdempotency}-${finalSlug}`,
            title: blogInput.title,
            slug: finalSlug,
            summary: blogInput.summary,
            category: blogInput.category,
            keywords: blogInput.keywords.split(',').map(k => k.trim()).filter(Boolean),
            hero_image_url: blogInput.hero_image_url || null,
            body_md: content,
            status: 'draft',
            publish_at: publishAt,
            created_at: now,
            updated_at: now,
        };
        setSupabasePayload(payload);
      }

    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [blogInput]);
  
  const handleRowSelect = useCallback((rowData: BlogInput) => {
    // Ensure date is in YYYY-MM-DD format for the input[type=date]
    // And auto-generate slug if it's missing from the CSV
    const formattedRowData: BlogInput = {
        ...rowData,
        slug: rowData.slug || generateSlug(rowData.title),
        publishDate: rowData.publishDate ? rowData.publishDate.split('T')[0] : '',
    };
    setBlogInput(formattedRowData);
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-brand-primary">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <CsvLoader onRowSelect={handleRowSelect} selectedTitle={blogInput.title} />
          <InputForm
            blogInput={blogInput}
            setBlogInput={setBlogInput}
            onSubmit={handleGenerate}
            isLoading={isLoading}
          />
        </div>
        <OutputDisplay
          markdownContent={generatedContent}
          supabasePayload={supabasePayload}
          isLoading={isLoading}
          error={error}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
