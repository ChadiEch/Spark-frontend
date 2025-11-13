import { useTheme } from "@/contexts/ThemeContext";

export function TestTheme() {
  const { theme, toggleTheme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    console.log('TestTheme: Toggling theme');
    toggleTheme();
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    console.log('TestTheme: Setting theme to', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="p-4 bg-background text-foreground border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Theme Test</h2>
      <p className="mb-2">Current theme: {theme}</p>
      <div className="flex space-x-2">
        <button 
          onClick={handleToggleTheme}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Toggle Theme
        </button>
        <button 
          onClick={() => handleSetTheme('light')}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
        >
          Set Light
        </button>
        <button 
          onClick={() => handleSetTheme('dark')}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
        >
          Set Dark
        </button>
      </div>
    </div>
  );
}