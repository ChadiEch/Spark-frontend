export function FallbackContent({ error }: { error?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Winnerforce</h1>
        {error ? (
          <div className="mb-6">
            <p className="text-destructive mb-4">{error}</p>
            <p className="text-muted-foreground">
              Please check your internet connection and ensure the backend server is running.
              If the problem persists, contact support.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">
            Marketing platform for managing campaigns, tracking goals, and collaborating with ambassadors.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground mb-1">Campaigns</h3>
            <p className="text-sm text-muted-foreground">Manage marketing campaigns</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground mb-1">Goals</h3>
            <p className="text-sm text-muted-foreground">Track performance metrics</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground mb-1">Tasks</h3>
            <p className="text-sm text-muted-foreground">Assign and track work</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">View performance data</p>
          </div>
        </div>
        {error && (
          <div className="mt-6">
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}