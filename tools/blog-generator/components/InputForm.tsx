import React, { useState, useCallback, useEffect } from 'react';
import { BlogInput } from '../types';
import { GenerateIcon } from './icons/GenerateIcon';

// Icon for the CSV upload button
const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);


interface CsvLoaderProps {
  onRowSelect: (rowData: BlogInput) => void;
  selectedTitle: string | null;
}

const parseCsvToBlogInputs = (csvText: string): BlogInput[] => {
  try {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error("CSV must have a header row and at least one data row.");
    }

    const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

    const headerMapping: { [key: string]: keyof BlogInput } = {
        'title': 'title',
        'category': 'category',
        'keywords': 'keywords',
        'summary': 'summary',
        'slug': 'slug',
        'publish date': 'publishDate',
        'publishdate': 'publishDate',
        'hero_image_url': 'hero_image_url',
        'idempotency_key': 'idempotency_key',
    };
    
    const keyMap: (keyof BlogInput | null)[] = csvHeaders.map(h => headerMapping[h] || null);
    
    const requiredFields: (keyof BlogInput)[] = ['title', 'category', 'keywords', 'summary'];
    const foundFields = keyMap.filter(k => k !== null) as (keyof BlogInput)[];
    
    const missingFields = requiredFields.filter(req => !foundFields.includes(req));
    if (missingFields.length > 0) {
        throw new Error(`CSV is missing required header(s): ${missingFields.join(', ')}`);
    }

    if (!foundFields.includes('publishDate')) {
        console.warn("CSV is missing optional header: 'publish date'. Dates will default to today.");
    }

    const dataRows = lines.slice(1).map((line) => {
      if (!line.trim()) return null;
      
      const values: string[] = [];
      let current = '';
      let inQuote = false;
      for (const char of line) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(current.replace(/"/g, '').trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.replace(/"/g, '').trim());

      if (values.length !== csvHeaders.length) {
        console.warn(`Skipping malformed CSV row: number of values (${values.length}) does not match number of headers (${csvHeaders.length}). Line: "${line}"`);
        return null;
      }

      const rowObject: Partial<BlogInput> = {};
      keyMap.forEach((key, index) => {
        if (key) {
          const value = values[index] ?? '';
          rowObject[key] = value;
        }
      });
      
      if (requiredFields.every(field => Object.prototype.hasOwnProperty.call(rowObject, field) && rowObject[field])) {
        return rowObject as BlogInput;
      }
      return null;

    }).filter((row): row is BlogInput => row !== null && !!row.title);

    return dataRows;
  } catch (error) {
    console.error("CSV Parsing Error:", error);
    throw error;
  }
};

const LOCAL_STORAGE_KEY = 'aiCryptoRiskBlogData';

export const CsvLoader: React.FC<CsvLoaderProps> = ({ onRowSelect, selectedTitle }) => {
  const [rows, setRows] = useState<BlogInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { fileName: savedFileName, rows: savedRows } = JSON.parse(savedData);
        if (savedFileName && Array.isArray(savedRows) && savedRows.length > 0) {
          setFileName(savedFileName);
          setRows(savedRows);
        }
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setRows([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsedData = parseCsvToBlogInputs(text);
        if (parsedData.length === 0) {
          setError("No valid data rows found in the CSV file.");
        } else {
          setRows(parsedData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ fileName: file.name, rows: parsedData }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred during parsing.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handleClearData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setRows([]);
    setFileName('');
    setError(null);
  };

  const handleRowClick = useCallback((row: BlogInput) => {
    onRowSelect(row);
  }, [onRowSelect]);

  return (
    <div className="bg-brand-secondary rounded-lg p-6 shadow-2xl mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-brand-text">Load Data from CSV</h2>
        {rows.length > 0 && (
          <button onClick={handleClearData} className="text-xs text-brand-light hover:text-red-400 transition-colors">Clear Saved Data</button>
        )}
      </div>

      <label htmlFor="csv-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-brand-accent text-brand-text font-bold py-3 px-4 rounded-md hover:bg-brand-light/30 transition-all duration-200">
        <UploadIcon />
        <span>{fileName ? `Loaded: ${fileName}` : 'Upload Spreadsheet (.csv)'}</span>
      </label>
      <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
      <p className="text-xs text-brand-light mt-2 text-center">Export your Google Sheet as a CSV file to upload.</p>
      {error && <div className="mt-4 text-red-400 bg-red-900/20 p-3 rounded-md text-sm">{error}</div>}
      {rows.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-brand-light mb-2">Select a row to populate form:</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {rows.map((row, index) => (
              <button
                key={index}
                onClick={() => handleRowClick(row)}
                className={`w-full text-left p-3 rounded-md transition-all duration-150 text-sm ${
                  selectedTitle === row.title
                    ? 'bg-brand-cyan/20 text-brand-cyan ring-1 ring-brand-cyan'
                    : 'bg-brand-primary/50 hover:bg-brand-accent/50 text-brand-text'
                }`}
              >
                {row.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface InputFormProps {
  blogInput: BlogInput;
  setBlogInput: React.Dispatch<React.SetStateAction<BlogInput>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputField: React.FC<{
  id: keyof BlogInput;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'date';
  as?: 'input' | 'textarea';
  rows?: number;
  placeholder?: string;
}> = ({ id, label, value, onChange, type = 'text', as = 'input', rows, placeholder }) => {
  const commonProps = {
    id,
    name: id,
    value: value || '',
    onChange,
    placeholder,
    className: "w-full bg-brand-secondary border border-brand-accent rounded-md p-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition duration-200 outline-none placeholder-brand-light/50",
  };

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-brand-light">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={rows}></textarea>
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
};

export const InputForm: React.FC<InputFormProps> = ({ blogInput, setBlogInput, onSubmit, isLoading }) => {
  
  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogInput(prev => {
        const newValues = { ...prev, [name]: value };

        // If title is changing, and the slug was likely auto-generated from the previous title
        // (or is empty), then auto-update the slug as well. This allows manual override.
        const oldSlug = prev.slug || '';
        const derivedFromOldTitle = generateSlug(prev.title);

        if (name === 'title' && (oldSlug === derivedFromOldTitle || oldSlug === '')) {
            newValues.slug = generateSlug(value);
        }
        
        return newValues;
    });
  };

  return (
    <div className="bg-brand-secondary rounded-lg p-6 shadow-2xl h-fit">
      <h2 className="text-xl font-semibold mb-6 text-brand-text">Blog Post Inputs</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
        <InputField id="title" label="Title" value={blogInput.title} onChange={handleChange} placeholder="e.g., The Rise of AI-Powered Phishing..." />
        <InputField id="category" label="Category" value={blogInput.category} onChange={handleChange} placeholder="e.g., Security, DeFi, NFTs" />
        <InputField id="keywords" label="Keywords (comma-separated)" value={blogInput.keywords} onChange={handleChange} placeholder="primary_keyword, secondary, another" />
        <InputField id="summary" label="Summary" value={blogInput.summary} onChange={handleChange} as="textarea" rows={4} placeholder="A brief overview of the blog post's topic." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField id="slug" label="Slug" value={blogInput.slug || ''} onChange={handleChange} placeholder="auto-generated-from-title" />
          <InputField id="publishDate" label="Publish Date (Optional)" value={blogInput.publishDate || ''} onChange={handleChange} type="date" />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-brand-cyan text-brand-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 disabled:bg-brand-accent disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <GenerateIcon />
              Generate Blog Post
            </>
          )}
        </button>
      </form>
    </div>
  );
};
