import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}

const SearchBar: React.FC<Props> = ({ placeholder = "Search...", value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBar;
