// 공통 스타일 (Tailwind CSS 클래스)
export const buttonStyles = {
  sm: "px-2 py-1 bg-gray-700 rounded text-xs active:bg-gray-600 transition-colors",
  icon: "w-7 h-7 flex items-center justify-center bg-gray-700 rounded text-sm active:bg-gray-600",
  action: "p-2 rounded text-xs font-medium",
};

// CSS-in-JS 스타일
export const globalStyles = `
  .btn-sm {
    padding: 0.25rem 0.5rem;
    background: #374151;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    transition: background-color 0.2s;
  }
  .btn-sm:active { background: #4b5563; }

  .btn-icon {
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #374151;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  .btn-icon:active { background: #4b5563; }

  .btn-action {
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .safe-area-top { padding-top: env(safe-area-inset-top); }
  .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
`;
