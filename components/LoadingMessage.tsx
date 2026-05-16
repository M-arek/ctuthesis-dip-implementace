export default function LoadingMessage() {
  return (
    <div className="flex gap-4 max-w-3xl mx-auto w-full group">
      
      {/* ZMĚNA: Profesionální AI avatar místo emotikonu */}
      <div className="w-8 h-8 mt-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-center text-primary shadow-sm">
        
        {/* Vektorová SVG ikona (AI Sparkle) - barvu přebírá z text-secondary výše */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
        </svg>
        
      </div>
    
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl rounded-tl-sm w-fit border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  );
}
