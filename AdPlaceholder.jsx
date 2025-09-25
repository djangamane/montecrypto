export function AdPlaceholder({ label }) {
  return (
    <div className="my-12 max-w-4xl mx-auto px-6">
      <div className="bg-gray-800/50 border border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center text-gray-500">
        {label}
      </div>
    </div>
  );
}