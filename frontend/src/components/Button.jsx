export default function Button({ children, className = '', loading = false, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
