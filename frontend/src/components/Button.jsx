export function Button({ children, onClick, className = "" }) {
    return (
      <button
        onClick={onClick}
        className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition ${className}`}
      >
        {children}
      </button>
    );
  }