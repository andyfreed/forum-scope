import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PriorityFiltersProps {
  selectedPriorities: string[];
  onPriorityToggle: (priority: string) => void;
}

const priorityConfig = {
  hot: { label: 'Hot', icon: '🔥', color: 'bg-accent-orange text-white' },
  trending: { label: 'Trending', icon: '📈', color: 'bg-success text-white' },
  news: { label: 'News', icon: '⚠️', color: 'bg-yellow-500 text-white' },
  help: { label: 'Help', icon: '❓', color: 'bg-purple-500 text-white' },
  market: { label: 'Market', icon: '📊', color: 'bg-indigo-500 text-white' },
  normal: { label: 'Normal', icon: '📄', color: 'bg-neutral-400 text-white' }
};

export default function PriorityFilters({ selectedPriorities, onPriorityToggle }: PriorityFiltersProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
        Priority Filter
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(priorityConfig).map(([priority, config]) => {
          const isSelected = selectedPriorities.includes(priority);
          return (
            <Button
              key={priority}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onPriorityToggle(priority)}
              className={`text-xs ${isSelected ? config.color : 'text-neutral-600 hover:text-neutral-800'}`}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}