import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestGoalCampaigns() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Test our goal-campaign association logic
    const tests = [];
    
    // Create sample goals
    const sampleGoals = [
      {
        id: 'goal-1',
        title: 'Sample Goal 1'
      },
      {
        id: 'goal-2',
        title: 'Sample Goal 2'
      }
    ];
    
    // Create sample campaigns with different goal reference formats
    const sampleCampaigns = [
      {
        id: 'campaign-1',
        name: 'Sample Campaign 1',
        goals: ['goal-1'] // String ID reference
      },
      {
        id: 'campaign-2',
        name: 'Sample Campaign 2',
        goals: [
          {
            id: 'goal-1',
            title: 'Sample Goal 1'
          }
        ] // Object reference
      },
      {
        id: 'campaign-3',
        name: 'Sample Campaign 3',
        goals: ['goal-2'] // String ID reference to different goal
      },
      {
        id: 'campaign-4',
        name: 'Sample Campaign 4',
        goals: [] // No goals
      }
    ];
    
    tests.push({
      name: 'Sample Data',
      goals: sampleGoals,
      campaigns: sampleCampaigns
    });
    
    // Test filtering logic for goal-1
    const goalId = 'goal-1';
    const associatedCampaigns = sampleCampaigns.filter(campaign => {
      return campaign.goals && campaign.goals.some(goalRef => {
        if (typeof goalRef === 'string') {
          return goalRef === goalId;
        } else {
          return goalRef.id === goalId;
        }
      });
    });
    
    tests.push({
      name: 'Campaigns associated with goal-1',
      goalId: goalId,
      associatedCampaigns: associatedCampaigns,
      count: associatedCampaigns.length
    });
    
    // Test filtering logic for goal-2
    const goalId2 = 'goal-2';
    const associatedCampaigns2 = sampleCampaigns.filter(campaign => {
      return campaign.goals && campaign.goals.some(goalRef => {
        if (typeof goalRef === 'string') {
          return goalRef === goalId2;
        } else {
          return goalRef.id === goalId2;
        }
      });
    });
    
    tests.push({
      name: 'Campaigns associated with goal-2',
      goalId: goalId2,
      associatedCampaigns: associatedCampaigns2,
      count: associatedCampaigns2.length
    });
    
    setTestResults(tests);
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Goal-Campaign Association Test</h1>
        <p>This test verifies that our goal-campaign association logic works correctly.</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.map((test, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="font-bold">{test.name}</h3>
                <p>Count: {test.count !== undefined ? test.count : 'N/A'}</p>
                <p>Goal ID: {test.goalId || 'N/A'}</p>
                <pre className="bg-muted p-2 rounded mt-2 max-h-60 overflow-auto">
                  {JSON.stringify(test, null, 2)}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}