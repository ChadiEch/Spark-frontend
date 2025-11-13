import { useEffect } from 'react';

export default function Test() {
  useEffect(() => {
    console.log('Test page loaded');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 bg-card rounded-lg shadow-card">
        <h1 className="text-3xl font-bold text-foreground mb-4">Test Page</h1>
        <p className="text-muted-foreground">If you can see this, the app is working!</p>
      </div>
    </div>
  );
}