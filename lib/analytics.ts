'use client';

type SearchEvent = {
  query: string;
  filters: Record<string, string[]>;
  sortBy: string;
  resultCount: number;
  timestamp: number;
};

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: SearchEvent[] = [];
  private readonly STORAGE_KEY = 'search_analytics';
  private readonly MAX_EVENTS = 100;

  private constructor() {
    this.loadEvents();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private loadEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics events:', error);
    }
  }

  private saveEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics events:', error);
    }
  }

  public trackSearch(event: Omit<SearchEvent, 'timestamp'>): void {
    const timestamp = Date.now();
    this.events.push({ ...event, timestamp });
    
    // Keep only the most recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
    
    this.saveEvents();
  }

  public getPopularSearches(limit = 5): { query: string; count: number }[] {
    const searchCounts = this.events.reduce((acc, event) => {
      acc[event.query] = (acc[event.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  public getFilterUsage(): Record<string, number> {
    const filterCounts: Record<string, number> = {};
    
    this.events.forEach(event => {
      Object.entries(event.filters).forEach(([filter, values]) => {
        if (values && values.length > 0) {
          filterCounts[filter] = (filterCounts[filter] || 0) + 1;
        }
      });
    });
    
    return filterCounts;
  }

  public getSearchConversionRate(): number {
    if (this.events.length === 0) return 0;
    
    const totalSearches = this.events.length;
    const successfulSearches = this.events.filter(e => e.resultCount > 0).length;
    
    return (successfulSearches / totalSearches) * 100;
  }

  public clearData(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
