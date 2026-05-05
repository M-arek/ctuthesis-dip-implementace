export default function LoadingMessage() {
  return (
    <div className="flex gap-4 max-w-3xl mx-auto w-full">
      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs animate-pulse shadow-md">
        ✨
      </div>
      <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm w-fit">
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  );
}
