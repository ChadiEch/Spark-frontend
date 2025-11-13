import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TestDashboard() {
  return (
    <div className="p-6 space-y-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Test Card 1</h3>
          <p className="text-muted-foreground">This is a test card to verify the UI is working</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Test Card 2</h3>
          <p className="text-muted-foreground">This is a test card to verify the UI is working</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Test Card 3</h3>
          <p className="text-muted-foreground">This is a test card to verify the UI is working</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Test Card 4</h3>
          <p className="text-muted-foreground">This is a test card to verify the UI is working</p>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button>Test Button</Button>
      </div>
    </div>
  );
}