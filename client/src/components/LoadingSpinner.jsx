export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  return (
    <div className="flex justify-center py-12">
      <div className={`${s} animate-spin rounded-full border-2 border-gray-200 border-t-brand-500`} />
    </div>
  );
}
