import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CategoryManager from "./category-manager";
import PriorityFilters from "./priority-filters";
import type { Category, Source, FilterOptions } from "@shared/schema";

interface SidebarFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  categories: Category[];
}

export default function SidebarFilters({ filters, onFiltersChange, categories }: SidebarFiltersProps) {
  const { data: sources = [] } = useQuery<Source[]>({
    queryKey: ['/api/sources'],
  });

  // Mock counts for categories (in real app, this would come from API)
  const categoryCounts = {
    'drones': 124,
    'rc-cars': 87,
    'rc-planes': 45,
    'fpv-racing': 33
  };

  const handleCategoryToggle = (categorySlug: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked 
      ? [...currentCategories, categorySlug]
      : currentCategories.filter(c => c !== categorySlug);
    
    onFiltersChange({ categories: newCategories });
  };

  const handleSourceToggle = (sourceName: string, checked: boolean) => {
    const currentSources = filters.sources || [];
    const newSources = checked 
      ? [...currentSources, sourceName]
      : currentSources.filter(s => s !== sourceName);
    
    onFiltersChange({ sources: newSources });
  };

  const handlePriorityToggle = (priority: string) => {
    const currentPriorities = filters.priorities || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    onFiltersChange({ priorities: newPriorities });
  };

  return (
    <Card className="border border-neutral-200">
      <CardContent className="p-6">
        {/* Categories Filter */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
              Categories
            </h3>
            <CategoryManager />
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center cursor-pointer">
                <Checkbox
                  checked={filters.categories?.includes(category.slug) || false}
                  onCheckedChange={(checked) => handleCategoryToggle(category.slug, checked as boolean)}
                  className="rounded border-neutral-300"
                />
                <span className="ml-2 text-sm text-neutral-700">{category.name}</span>
                <Badge 
                  variant={filters.categories?.includes(category.slug) ? "default" : "secondary"}
                  className="ml-auto text-xs"
                >
                  {categoryCounts[category.slug as keyof typeof categoryCounts] || 0}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        {/* Time Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
            Time Range
          </h3>
          <Select value={filters.timeRange} onValueChange={(value: any) => onFiltersChange({ timeRange: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last week</SelectItem>
              <SelectItem value="30d">Last month</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <PriorityFilters 
          selectedPriorities={filters.priorities || []}
          onPriorityToggle={handlePriorityToggle}
        />

        {/* Source Filter */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
            Sources
          </h3>
          <div className="space-y-2">
            {sources.map((source) => (
              <label key={source.id} className="flex items-center cursor-pointer">
                <Checkbox
                  checked={filters.sources?.includes(source.name) || false}
                  onCheckedChange={(checked) => handleSourceToggle(source.name, checked as boolean)}
                  className="rounded border-neutral-300"
                />
                <span className="ml-2 text-sm text-neutral-700">{source.name}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
