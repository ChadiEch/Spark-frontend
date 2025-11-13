import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeTest() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="p-6 bg-background text-foreground border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Theme Test</h2>
      <div className="space-y-4">
        <div>
          <p className="text-lg">Current theme: <span className="font-bold">{theme}</span></p>
          <p className="text-sm text-muted-foreground">
            Document has dark class: {document.documentElement.classList.contains('dark') ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={toggleTheme} variant="default">
            Toggle Theme
          </Button>
          <Button onClick={() => setTheme('light')} variant="secondary">
            Set Light
          </Button>
          <Button onClick={() => setTheme('dark')} variant="secondary">
            Set Dark
          </Button>
        </div>
      </div>
    </div>
  );
}