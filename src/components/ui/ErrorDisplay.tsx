import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Info } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  errorDetails?: string;
}

export function ErrorDisplay({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  className = "",
  errorDetails
}: ErrorDisplayProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4 text-red-500">
        <AlertCircle className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      
      {errorDetails && (
        <details className="mb-6 max-w-md text-left bg-muted p-4 rounded-md">
          <summary className="flex items-center cursor-pointer text-sm font-medium">
            <Info className="h-4 w-4 mr-2" />
            Error Details
          </summary>
          <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{errorDetails}</p>
        </details>
      )}
      
      {onRetry && (
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground">
        If this problem persists, please contact support.
      </p>
    </div>
  );
}