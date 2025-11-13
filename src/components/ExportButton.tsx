import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { ExportService, ExportOptions } from '@/services/exportService';

interface ExportButtonProps {
  data: any[];
  dataType: 'posts' | 'campaigns' | 'tasks' | 'goals' | 'assets' | 'ambassadors' | 'users';
  fileName?: string;
  onExport?: (format: 'csv' | 'xlsx' | 'pdf') => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  dataType, 
  fileName,
  onExport,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    if (disabled || isExporting || data.length === 0) return;
    
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        fileName: fileName || `${dataType}_export_${new Date().toISOString().split('T')[0]}`
      };

      switch (dataType) {
        case 'posts':
          ExportService.exportPosts(data, options);
          break;
        case 'campaigns':
          ExportService.exportCampaigns(data, options);
          break;
        case 'tasks':
          ExportService.exportTasks(data, options);
          break;
        case 'goals':
          ExportService.exportGoals(data, options);
          break;
        case 'assets':
          ExportService.exportAssets(data, options);
          break;
        case 'ambassadors':
          ExportService.exportAmbassadors(data, options);
          break;
        case 'users':
          ExportService.exportUsers(data, options);
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled || isExporting || data.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <span>CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            <span>Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <span>PDF</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;