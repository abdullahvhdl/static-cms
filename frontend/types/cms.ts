export interface SiteConfig {
  title: string;
  description: string;
}

export interface PageItem {
  title: string;
  description?: string;
  link?: string;
}

export interface PageData {
  slug: string;
  title: string;
  template: 'home' | 'listing' | 'detail';
  description?: string;
  content?: string;
  category?: string;
  author?: string;
  publishDate?: string;
  readTime?: number;
  featuredImage?: string;
  tags?: string[];
  items?: PageItem[];
}

export interface SiteData {
  site: SiteConfig;
  pages: PageData[];
}
