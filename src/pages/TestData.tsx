import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePosts, useCampaigns } from "@/hooks/useData";

export default function TestData() {
  const { posts, loading: postsLoading, error: postsError } = usePosts();
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns();
  const [testData, setTestData] = useState({ posts: [], campaigns: [] });

  useEffect(() => {
    console.log('Posts:', posts);
    console.log('Campaigns:', campaigns);
    setTestData({ posts, campaigns });
  }, [posts, campaigns]);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Test Data</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <p>Loading posts...</p>
              ) : postsError ? (
                <p className="text-red-500">Error loading posts: {postsError}</p>
              ) : (
                <div>
                  <p>Total posts: {posts.length}</p>
                  <pre className="bg-muted p-4 rounded mt-2 max-h-96 overflow-auto">
                    {JSON.stringify(posts, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <p>Loading campaigns...</p>
              ) : campaignsError ? (
                <p className="text-red-500">Error loading campaigns: {campaignsError}</p>
              ) : (
                <div>
                  <p>Total campaigns: {campaigns.length}</p>
                  <pre className="bg-muted p-4 rounded mt-2 max-h-96 overflow-auto">
                    {JSON.stringify(campaigns, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Combined Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded max-h-96 overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}