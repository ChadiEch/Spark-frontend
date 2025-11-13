// Generic entity form component with TypeScript generics
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type FieldTypes = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'password';

interface FormField<T> {
  name: keyof T;
  label: string;
  type: FieldTypes;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  render?: (value: any, onChange: (value: any) => void) => React.ReactNode;
}

interface GenericEntityFormProps<T> {
  title: string;
  fields: FormField<T>[];
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  loading?: boolean;
}

export function GenericEntityForm<T extends Record<string, any>>({
  title,
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Save',
  cancelButtonText = 'Cancel',
  loading = false
}: GenericEntityFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name as string] = initialValues[field.name] ?? field.defaultValue ?? '';
    });
    return initial;
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as T);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name as string} className="space-y-2">
              <Label htmlFor={field.name as string}>
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              
              {field.render ? (
                field.render(formData[field.name as string], (value) => handleChange(field.name as string, value))
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.name as string}
                  placeholder={field.placeholder}
                  value={formData[field.name as string]}
                  onChange={(e) => handleChange(field.name as string, e.target.value)}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formData[field.name as string]}
                  onValueChange={(value) => handleChange(field.name as string, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={field.name as string}
                    checked={formData[field.name as string]}
                    onChange={(e) => handleChange(field.name as string, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={field.name as string} className="ml-2">
                    {field.placeholder}
                  </Label>
                </div>
              ) : (
                <Input
                  type={field.type}
                  id={field.name as string}
                  placeholder={field.placeholder}
                  value={formData[field.name as string]}
                  onChange={(e) => handleChange(field.name as string, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Card>
  );
}