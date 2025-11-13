// Generic entity list component with TypeScript generics
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface GenericEntityListProps<T extends { id: string }> {
  title: string;
  entities: T[];
  columns: ColumnConfig<T>[];
  onAdd?: () => void;
  onEdit?: (entity: T) => void;
  onDelete?: (entity: T) => void;
  loading?: boolean;
  searchable?: boolean;
  searchableFields?: (keyof T)[];
}

export function GenericEntityList<T extends { id: string }>({
  title,
  entities,
  columns,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
  searchable = false,
  searchableFields = []
}: GenericEntityListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter entities based on search term
  const filteredEntities = searchable && searchTerm
    ? entities.filter(entity =>
        searchableFields.some(field => {
          const value = entity[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : entities;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredEntities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm ? 'No matching entities found' : `No ${title.toLowerCase()} found`}
          </p>
          {onAdd && (
            <Button onClick={onAdd} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Create Your First {title}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntities.map((entity) => (
            <Card key={entity.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {columns.map((column) => (
                  <div key={`${entity.id}-${String(column.key)}`} className="min-w-0">
                    <div className="text-sm text-muted-foreground">{column.label}</div>
                    <div className="font-medium truncate">
                      {column.render
                        ? column.render(entity[column.key], entity)
                        : String(entity[column.key])}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entity)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(entity)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}