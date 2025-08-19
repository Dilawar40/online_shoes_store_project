"use client";

import { useProduct } from "./product-context";
import type { ProductOption } from "@/types/ecommerce.types";

type Variant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
};

type VariantSelectorProps = {
  options: ProductOption[];
  variants: Variant[];
};

export function VariantSelector({ options = [], variants = [] }: VariantSelectorProps) {
  const { state, updateOption } = useProduct();

  // If there are no options or only one option with one value, don't show the selector
  if (!options.length || (options.length === 1 && options[0]?.values.length === 1)) {
    return null;
  }

  // Create a map of variant combinations for quick lookup
  const variantMap = variants.reduce<Record<string, boolean>>((acc, variant) => {
    const key = variant.selectedOptions
      .map(opt => `${opt.name}:${opt.value}`)
      .sort()
      .join('|');
    acc[key] = variant.availableForSale;
    return acc;
  }, {});

  // Check if an option value is available given the current selections
  const isOptionAvailable = (optionName: string, optionValue: string): boolean => {
    const currentSelections = { ...state, [optionName]: optionValue };
    
    // Check if any variant matches the current selections
    return variants.some(variant => {
      return variant.selectedOptions.every(opt => {
        const selectedValue = currentSelections[opt.name.toLowerCase()];
        if (!selectedValue) return true; // Skip unselected options
        
        // Handle size options that might be combined with slashes
        if (opt.name.toLowerCase() === 'size' && opt.value.includes('/')) {
          return opt.value.split('/').map(s => s.trim()).includes(selectedValue);
        }
        
        return opt.value === selectedValue;
      });
    });
  };

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    updateOption(optionName, value);
  };

  // Get unique values for an option, handling combined values
  const getUniqueValues = (values: string[]): string[] => {
    const unique = new Set<string>();
    
    values.forEach(value => {
      if (value.includes('/')) {
        value.split('/').forEach(v => unique.add(v.trim()));
      } else {
        unique.add(value);
      }
    });
    
    return Array.from(unique).sort();
  };

  return (
    <div className="space-y-6">
      {options.map((option) => {
        const optionName = option.name.toLowerCase();
        const uniqueValues = getUniqueValues(option.values);
        
        return (
          <div key={option.id} className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {option.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueValues.map((value) => {
                const isSelected = state[optionName] === value;
                const isAvailable = isOptionAvailable(optionName, value);
                
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleOptionSelect(optionName, value)}
                    disabled={!isAvailable}
                    className={`
                      px-3 py-1 text-sm rounded-md border
                      ${isSelected 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title={!isAvailable ? 'Out of stock' : ''}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
