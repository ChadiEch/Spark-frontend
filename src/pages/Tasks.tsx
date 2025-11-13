import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Checkbox } from "../components/ui/checkbox"
import { Input } from "../components/ui/input"
import ExportButton from "../components/ExportButton"
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Filter,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Search,
  Clock,
  Pause,
  CheckCircle2,
  Grid3X3,
  List,
  Archive,
  ArchiveRestore,
  Trash
} from "lucide-react"
// Import our data hooks
import { useTasks, useUsers } from "../hooks/useData"
import { useTasksQuery } from "../hooks/useQueryData"
import { Task, User as UserType } from "../types"
import { toast } from "../components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { TaskForm } from "../components/forms/TaskForm"
import { TaskCard } from "../components/TaskCard"
import { ErrorDisplay } from "../components/ui/ErrorDisplay"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { RoleBasedContent, ResourceBasedContent } from "../components/ui/RoleBasedContent"

export default function Tasks() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTrashed, setShowTrashed] = useState(false); // New state for trashed tasks view
  
  const { data, isLoading, isError, error, refetch } = useTasksQuery({
    page,
    limit,
    search: searchQuery,
    status: showTrashed ? 'TRASH' : (statusFilter !== 'all' ? statusFilter : undefined)
  });
  
  const { deleteTask, trashItem, restoreItem } = useTasks(); // Use the old hook for delete functionality
  
  const tasks = data?.data || [];
  const loading = isLoading;
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;
  
  const { users } = useUsers()
  const [filter, setFilter] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const filterMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  
  // Refs for keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const newTaskButtonRef = useRef<HTMLButtonElement>(null);

  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        task.assignees.some(assignee => assignee.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    OPEN: filteredTasks.filter(task => task.status === 'OPEN'),
    IN_PROGRESS: filteredTasks.filter(task => task.status === 'IN_PROGRESS'),
    BLOCKED: filteredTasks.filter(task => task.status === 'BLOCKED'),
    DONE: filteredTasks.filter(task => task.status === 'DONE')
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Esc to close dialogs
      if (e.key === 'Escape') {
        setShowTaskForm(false);
        setEditingTask(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        const success = await deleteTask(taskId);
        if (success) {
          toast({
            title: "Task Deleted",
            description: "The task has been deleted successfully!",
          })
          refetch();
        } else {
          toast({
            title: "Error Deleting Task",
            description: "Failed to delete task. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error('Error deleting task:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = error.message || "Failed to delete task. Please try again.";
        
        if (error.message && error.message.includes('Network Error')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        toast({
          title: "Error Deleting Task",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  // New function to handle trashing a task
  const handleTrashTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to move this task to trash?')) {
      try {
        const success = await trashItem(taskId);
        if (success) {
          toast({
            title: "Task Trashed",
            description: "The task has been moved to trash!",
          })
          refetch();
        } else {
          toast({
            title: "Error Trashing Task",
            description: "Failed to trash task. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error('Error trashing task:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = error.message || "Failed to trash task. Please try again.";
        
        if (error.message && error.message.includes('Network Error')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        toast({
          title: "Error Trashing Task",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  // New function to handle restoring a task
  const handleRestoreTask = async (taskId: string) => {
    try {
      const success = await restoreItem(taskId);
      if (success) {
        toast({
          title: "Task Restored",
          description: "The task has been restored successfully!",
        })
        refetch();
      } else {
        toast({
          title: "Error Restoring Task",
          description: "Failed to restore task. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Error restoring task:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = error.message || "Failed to restore task. Please try again.";
      
      if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast({
        title: "Error Restoring Task",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (taskId: string) => {
    // Navigate to task details page
    navigate(`/tasks/view/${taskId}`);
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleTaskFormSuccess = () => {
    setShowTaskForm(false)
    setEditingTask(null)
    refetch()
    
    toast({
      title: editingTask ? "Task Updated" : "Task Created",
      description: editingTask 
        ? "The task has been updated successfully!" 
        : "The task has been created successfully!",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'TRASH': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {showTrashed ? "Trashed Tasks" : "Tasks"}
            </h1>
            <p className="text-muted-foreground">
              Manage your marketing tasks and activities
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowTrashed(!showTrashed)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {showTrashed ? (
                <>
                  <ArchiveRestore className="h-4 w-4" />
                  <span>View Active Tasks</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span>View Trashed</span>
                </>
              )}
            </Button>
            <ExportButton data={tasks} dataType="tasks" fileName="tasks" />
            <Button 
              onClick={handleCreateTask}
              ref={newTaskButtonRef}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                ref={searchInputRef}
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
                {showTrashed && <option value="TRASH">Trashed</option>}
              </select>
              
              <Button
                variant="outline"
                onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
              >
                {view === 'kanban' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3X3 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <LoadingSpinner />}
          {isError && <ErrorDisplay message={error?.message || "Failed to load tasks"} onRetry={refetch} />}

          {/* Task List */}
          {!loading && !isError && (
            <>
              {view === 'list' ? (
                // List View
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {showTrashed 
                          ? "No trashed tasks found." 
                          : searchQuery || statusFilter !== 'all' 
                            ? "No tasks match your filters." 
                            : "No tasks found. Create your first task!"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredTasks.map((task) => (
                        <Card key={task.id} className={task.status === 'TRASH' ? 'border-dashed border-gray-300' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{task.title}</h3>
                                  <Badge className={getStatusColor(task.status)}>
                                    {task.status}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  {task.due && (
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(task.due).toLocaleDateString()}
                                    </div>
                                  )}
                                  {task.assignees.length > 0 && (
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {task.assignees.map(a => a.name).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {task.status === 'TRASH' ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRestoreTask(task.id)}
                                    >
                                      <ArchiveRestore className="h-4 w-4 mr-1" />
                                      Restore
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteTask(task.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewDetails(task.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditTask(task)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTrashTask(task.id)}
                                    >
                                      <Archive className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Kanban View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(tasksByStatus).map(([status, tasks]) => (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          {status.replace('_', ' ')} ({tasks.length})
                        </h3>
                      </div>
                      <div className="space-y-2 min-h-[100px]">
                        {tasks.map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onViewDetails={handleViewDetails}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onTrash={handleTrashTask}
                            onRestore={handleRestoreTask}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} tasks
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Create Task"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm 
            initialData={editingTask ? {
              title: editingTask.title,
              description: editingTask.description || '',
              dueDate: editingTask.due ? new Date(editingTask.due) : undefined,
              status: editingTask.status,
              priority: editingTask.priority,
              assignees: editingTask.assignees.map(a => a.id),
              relatedCampaign: editingTask.relatedCampaign ? 
                (typeof editingTask.relatedCampaign === 'string' ? 
                  editingTask.relatedCampaign : 
                  editingTask.relatedCampaign.id) : undefined
            } : undefined}
            onSubmit={handleTaskFormSuccess}
            onCancel={() => setShowTaskForm(false)}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}