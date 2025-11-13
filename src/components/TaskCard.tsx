import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  User, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Circle,
  Archive
} from "lucide-react"
import { Task } from "@/types"
import { toast } from "@/components/ui/use-toast"

interface TaskCardProps {
  task: Task
  onViewDetails?: (taskId: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onTrash?: (taskId: string) => void
  onRestore?: (taskId: string) => void
}

export function TaskCard({ task, onViewDetails, onEdit, onDelete, onTrash, onRestore }: TaskCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(task.id)
    } else {
      toast({
        title: "View Task",
        description: "Viewing task details would be implemented in a production environment.",
      })
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    } else {
      toast({
        title: "Edit Task",
        description: "Editing tasks would be implemented in a production environment.",
      })
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to permanently delete this task?')) {
        onDelete(task.id)
      }
    } else {
      toast({
        title: "Delete Task",
        description: "Deleting tasks would be implemented in a production environment.",
      })
    }
  }

  const handleTrash = () => {
    if (onTrash) {
      if (window.confirm('Are you sure you want to move this task to trash?')) {
        onTrash(task.id)
      }
    } else {
      toast({
        title: "Trash Task",
        description: "Trashing tasks would be implemented in a production environment.",
      })
    }
  }

  const handleRestore = () => {
    if (onRestore) {
      if (window.confirm('Are you sure you want to restore this task?')) {
        onRestore(task.id)
      }
    } else {
      toast({
        title: "Restore Task",
        description: "Restoring tasks would be implemented in a production environment.",
      })
    }
  }

  // Get priority color classes
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 hover:bg-red-600';
      case 'HIGH': return 'bg-orange-500 hover:bg-orange-600';
      case 'MEDIUM': return 'bg-blue-500 hover:bg-blue-600';
      case 'LOW': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'BLOCKED': return 'bg-red-500';
      case 'OPEN': return 'bg-gray-500';
      case 'TRASH': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={`bg-gradient-card shadow-card border-0 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${task.status === 'TRASH' ? 'border-dashed border-gray-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {task.status === 'DONE' ? (
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            ) : task.status === 'TRASH' ? (
              <Archive className="h-5 w-5 text-gray-400 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className={`font-medium text-sm leading-none ${task.status === 'TRASH' ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            {task.status === 'TRASH' ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleRestore}
                  aria-label={`Restore task ${task.title}`}
                >
                  <Archive className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleDelete}
                  aria-label={`Permanently delete task ${task.title}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleViewDetails}
                  aria-label={`View details for task ${task.title}`}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleEdit}
                  aria-label={`Edit task ${task.title}`}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleTrash}
                  aria-label={`Move task ${task.title} to trash`}
                >
                  <Archive className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {task.due ? new Date(task.due).toLocaleDateString() : 'No due date'}
          </div>
          <div className="flex items-center">
            <User className="mr-1 h-3 w-3" />
            {task.assignees && task.assignees.length > 0 
              ? task.assignees.map(a => a.name).join(', ') 
              : 'Unassigned'}
          </div>
          <Badge 
            variant="default"
            className={`text-xs text-white ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </Badge>
          <Badge 
            variant="default"
            className={`text-xs text-white ${getStatusColor(task.status)}`}
          >
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}