import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  DollarSign,
  Activity
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PageLayout } from "@/components/layout/PageLayout";

export default function Index() {
  return (
    <PageLayout>
      <Dashboard />
    </PageLayout>
  );
}