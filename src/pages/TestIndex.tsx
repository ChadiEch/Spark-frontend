import { TestDashboard } from '@/components/dashboard/TestDashboard';
import { PageLayout } from '@/components/layout/PageLayout';
import { ApiTest } from '@/components/ApiTest';
import { Link } from 'react-router-dom';

const TestIndex = () => {
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TestDashboard />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-lg shadow-card mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Links</h2>
            <div className="space-y-2">
              <Link to="/test/backend-connectivity" className="block text-blue-600 hover:underline">
                Backend & Database Connectivity Test
              </Link>
            </div>
          </div>
          <ApiTest />
        </div>
      </div>
    </PageLayout>
  );
};

export default TestIndex;