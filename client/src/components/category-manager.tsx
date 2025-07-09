import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Settings2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Category, CreateCategoryForm } from "@shared/schema";
import { createCategoryFormSchema } from "@shared/schema";

export default function CategoryManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all categories (including inactive ones for management)
  const { data: allCategories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/categories?includeInactive=true');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const form = useForm<CreateCategoryForm>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryForm) => {
      return apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Toggle category active status
  const toggleCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return apiRequest(`/api/categories/${categoryId}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category status updated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCategoryForm) => {
    createCategoryMutation.mutate(data);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    form.setValue('slug', slug);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-neutral-600 hover:text-primary">
          <Settings2 className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Management</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Category Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Model Trains"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleNameChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="model-trains"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe this hobby category..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Existing Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading categories...</div>
              ) : (
                <div className="space-y-3">
                  {allCategories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-neutral-900">{category.name}</h4>
                          <Badge 
                            variant={category.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          /{category.slug}
                        </p>
                        {category.description && (
                          <p className="text-sm text-neutral-500 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryMutation.mutate(category.id)}
                          disabled={toggleCategoryMutation.isPending}
                          className="text-neutral-500 hover:text-neutral-700"
                        >
                          {category.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}