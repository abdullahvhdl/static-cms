import { parse } from 'yaml';
import type { SiteData } from '../types/cms';

const YAML_STORAGE_KEY = 'cms_site_data';

// Default site data
const defaultSiteData: SiteData = {
  site: {
    title: "My Static CMS",
    description: "A simple static content management system"
  },
  pages: [
    {
      slug: "home",
      title: "Welcome to My CMS",
      template: "home",
      description: "A modern, minimal content management system",
      items: [
        {
          title: "Blog",
          description: "Read our latest articles and insights",
          link: "/blog"
        },
        {
          title: "Portfolio",
          description: "Check out our latest projects",
          link: "/portfolio"
        },
        {
          title: "About",
          description: "Learn more about what we do",
          link: "/about"
        }
      ]
    },
    {
      slug: "blog",
      title: "Blog Posts",
      template: "listing",
      description: "Our latest articles and insights",
      category: "blog",
      items: [
        {
          title: "Getting Started with Static CMS",
          description: "Learn how to use our static CMS effectively",
          link: "/blog/getting-started"
        },
        {
          title: "Best Practices for Content Management",
          description: "Tips and tricks for managing your content",
          link: "/blog/best-practices"
        }
      ]
    },
    {
      slug: "getting-started",
      title: "Getting Started with Static CMS",
      template: "detail",
      description: "A comprehensive guide to using our static content management system",
      category: "blog",
      author: "CMS Team",
      publishDate: "2024-01-15",
      readTime: 5,
      tags: ["tutorial", "cms", "guide"],
      content: `Welcome to our static CMS! This guide will help you get started with creating and managing your content.

## What is a Static CMS?

A static CMS is a content management system that generates static websites. Unlike traditional CMSs that rely on databases and server-side processing, static CMSs create pre-built HTML files that can be served quickly and securely.

## Key Features

- **Fast Performance**: Static sites load quickly since there's no database queries
- **High Security**: No server-side vulnerabilities or database attacks
- **Easy Deployment**: Deploy anywhere that serves static files
- **Version Control**: Track changes with Git
- **Cost Effective**: Minimal hosting requirements

## Getting Started

1. **Create Your Content**: Use the admin panel to add new pages
2. **Choose Templates**: Select from home, listing, or detail page templates
3. **Configure YAML**: Edit the YAML configuration for advanced customization
4. **Preview**: View your changes in real-time
5. **Deploy**: Export your static files for deployment

## Template Types

### Home Page
The home page template displays a grid of cards, perfect for navigation or showcasing key sections of your site.

### Listing Page
Listing pages show a collection of links or items, ideal for blog post lists, portfolios, or resource collections.

### Detail Page
Detail pages are perfect for blog posts, articles, or any content that needs a full page layout with rich text content.

## Tips for Success

- Keep your content organized with clear categories
- Use descriptive slugs for better SEO
- Optimize images for web performance
- Regular backup your YAML configuration

Happy content creating!`
    },
    {
      slug: "best-practices",
      title: "Best Practices for Content Management",
      template: "detail",
      description: "Essential tips and strategies for effective content management",
      category: "blog",
      author: "Content Team",
      publishDate: "2024-01-20",
      readTime: 7,
      tags: ["best-practices", "content", "strategy"],
      content: `Content management is both an art and a science. Here are some best practices to help you create and maintain high-quality content.

## Content Strategy

### Know Your Audience
Understanding your audience is crucial for creating relevant and engaging content. Consider:
- Demographics and psychographics
- Content preferences and consumption habits
- Pain points and challenges
- Goals and motivations

### Plan Your Content
- Create a content calendar
- Define clear objectives for each piece
- Maintain consistency in tone and style
- Plan for different content types and formats

## Content Creation

### Writing Best Practices
- Start with a compelling headline
- Use clear, concise language
- Structure content with headings and subheadings
- Include relevant examples and case studies
- End with a clear call-to-action

### SEO Optimization
- Research and use relevant keywords naturally
- Optimize meta descriptions and titles
- Use descriptive alt text for images
- Create internal links between related content
- Ensure fast page loading times

## Content Maintenance

### Regular Updates
- Review content for accuracy and relevance
- Update outdated information and links
- Refresh older content with new insights
- Archive or redirect obsolete pages

### Performance Monitoring
- Track content performance metrics
- Analyze user engagement and behavior
- Identify top-performing content
- Learn from less successful pieces

## Quality Assurance

### Editorial Process
- Establish a review workflow
- Use consistent style guidelines
- Fact-check all information
- Proofread for grammar and spelling
- Test all links and functionality

### Accessibility
- Use proper heading hierarchy
- Provide alt text for images
- Ensure good color contrast
- Write descriptive link text
- Test with screen readers

Following these best practices will help you create content that not only engages your audience but also achieves your business objectives.`
    }
  ]
};

export async function loadSiteData(): Promise<SiteData> {
  try {
    // Try to load from localStorage first
    const stored = localStorage.getItem(YAML_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = parse(stored);
        return parsed as SiteData;
      } catch (error) {
        console.warn('Failed to parse stored YAML, using default data:', error);
      }
    }

    // Try to load from public folder
    try {
      const response = await fetch('/site-data.yaml');
      if (response.ok) {
        const yamlText = await response.text();
        const parsed = parse(yamlText);
        
        // Store in localStorage for future edits
        localStorage.setItem(YAML_STORAGE_KEY, yamlText);
        
        return parsed as SiteData;
      }
    } catch (error) {
      console.warn('Failed to load site-data.yaml from public folder:', error);
    }

    // Fall back to default data
    const defaultYaml = generateYamlString(defaultSiteData);
    localStorage.setItem(YAML_STORAGE_KEY, defaultYaml);
    return defaultSiteData;
    
  } catch (error) {
    console.error('Failed to load site data:', error);
    return defaultSiteData;
  }
}

export async function saveSiteData(yamlContent: string): Promise<boolean> {
  try {
    // Validate YAML syntax
    const parsed = parse(yamlContent);
    
    // Store in localStorage
    localStorage.setItem(YAML_STORAGE_KEY, yamlContent);
    
    // Create downloadable file
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-data.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to save site data:', error);
    return false;
  }
}

function generateYamlString(data: SiteData): string {
  return `site:
  title: "${data.site.title}"
  description: "${data.site.description}"

pages:
${data.pages.map(page => `  - slug: "${page.slug}"
    title: "${page.title}"
    template: "${page.template}"${page.description ? `
    description: "${page.description}"` : ''}${page.category ? `
    category: "${page.category}"` : ''}${page.author ? `
    author: "${page.author}"` : ''}${page.publishDate ? `
    publishDate: "${page.publishDate}"` : ''}${page.readTime ? `
    readTime: ${page.readTime}` : ''}${page.featuredImage ? `
    featuredImage: "${page.featuredImage}"` : ''}${page.content ? `
    content: |
${page.content.split('\n').map(line => `      ${line}`).join('\n')}` : ''}${page.tags && page.tags.length > 0 ? `
    tags:
${page.tags.map(tag => `      - "${tag}"`).join('\n')}` : ''}${page.items && page.items.length > 0 ? `
    items:
${page.items.map(item => `      - title: "${item.title}"${item.description ? `
        description: "${item.description}"` : ''}${item.link ? `
        link: "${item.link}"` : ''}`).join('\n')}` : ''}`).join('\n')}`;
}
