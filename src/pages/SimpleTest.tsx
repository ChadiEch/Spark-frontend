import { PageLayout } from '@/components/layout/PageLayout';

export default function SimpleTest() {
  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-card">
          <h1 className="text-3xl font-bold text-foreground mb-4">Simple Test Page</h1>
          <p className="text-muted-foreground mb-4">If you can see this, the basic React components are working!</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h2 className="font-semibold text-primary">Column 1</h2>
              <p className="text-sm text-muted-foreground">Test content</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h2 className="font-semibold text-primary">Column 2</h2>
              <p className="text-sm text-muted-foreground">Test content</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h2 className="font-semibold text-primary">Column 3</h2>
              <p className="text-sm text-muted-foreground">Test content</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}