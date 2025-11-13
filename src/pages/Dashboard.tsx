import { Dashboard } from '../components/dashboard/Dashboard';
import { PageLayout } from '../components/layout/PageLayout';
import { ApiTest } from '../components/ApiTest';

const DashboardPage = () => {
  return (
    <PageLayout>
      <div className="space-y-6 p-1 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Dashboard />
          </div>
          <div className="lg:col-span-1">
            <ApiTest />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;