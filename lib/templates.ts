export interface Template {
  id: string;
  platform: 'TikTok' | 'Instagram' | 'Facebook';
  title: string;
  description: string;
  prompt: string;
  tone: string;
  goal: string;
  tags: string[];
}

export const templates: Template[] = [
  // ─── TikTok ────────────────────────────────────────────
  {
    id: 'tt-day-in-life',
    platform: 'TikTok',
    title: 'Day in the Life',
    description: 'Hook viewers with a behind-the-scenes look at your business day. High engagement format that humanizes your brand.',
    prompt: 'Create a "day in the life" style post showing what goes into running my business, from morning prep to serving customers, highlighting the passion and hard work behind the scenes',
    tone: 'Casual',
    goal: 'Engagement',
    tags: ['Viral Hook', 'Behind the Scenes'],
  },
  {
    id: 'tt-quick-tip',
    platform: 'TikTok',
    title: 'Quick Tip / Hack',
    description: 'Share a fast, actionable tip related to your industry. Educational content that gets saved and shared.',
    prompt: 'Share a quick tip or hack that customers can use related to my industry, something most people don\'t know but would find immediately useful',
    tone: 'Educational',
    goal: 'Awareness',
    tags: ['Educational', 'Save-worthy'],
  },
  {
    id: 'tt-pov',
    platform: 'TikTok',
    title: 'POV / Relatable Moment',
    description: 'Playful POV format that taps into shared experiences. Great for building community and getting comments.',
    prompt: 'Create a relatable POV-style post from the perspective of a customer discovering or using my product/service, focusing on the emotional experience and everyday moments',
    tone: 'Playful',
    goal: 'Community Building',
    tags: ['Relatable', 'Community'],
  },

  // ─── Instagram ─────────────────────────────────────────
  {
    id: 'ig-carousel',
    platform: 'Instagram',
    title: 'Carousel Slide Hook',
    description: 'Multi-slide carousel caption that hooks on slide 1 and delivers value across slides. High save rate format.',
    prompt: 'Write an engaging carousel caption that hooks readers in the first line, then delivers 5-7 valuable tips or insights about my product/service, ending with a strong call-to-action',
    tone: 'Professional',
    goal: 'Engagement',
    tags: ['Carousel', 'High Save Rate'],
  },
  {
    id: 'ig-reel-hook',
    platform: 'Instagram',
    title: 'Reel Opening Hook',
    description: 'Stop-the-scroll reel caption with a punchy hook line, context, and engagement CTA. Optimized for reach.',
    prompt: 'Create an Instagram reel caption with a strong hook in the first line that stops the scroll, followed by a short story or insight about my brand, ending with a question to drive comments',
    tone: 'Bold',
    goal: 'Awareness',
    tags: ['Reel', 'Reach'],
  },
  {
    id: 'ig-product-spotlight',
    platform: 'Instagram',
    title: 'Product Spotlight',
    description: 'Clean product/service showcase with benefits-focused copy. Drives consideration and clicks.',
    prompt: 'Write a product spotlight post that highlights 3 key benefits of my product/service, uses aspirational language, and includes a clear call-to-action to learn more or try it',
    tone: 'Inspirational',
    goal: 'Sales',
    tags: ['Product', 'Conversion'],
  },

  // ─── Facebook ──────────────────────────────────────────
  {
    id: 'fb-event-promo',
    platform: 'Facebook',
    title: 'Event / Launch Promo',
    description: 'Build anticipation for an upcoming event, sale, or product launch. Drives RSVPs and shares.',
    prompt: 'Create a Facebook post promoting an upcoming event or product launch at my business, building excitement with details about what\'s happening, why it matters, and how to participate',
    tone: 'Professional',
    goal: 'Awareness',
    tags: ['Event', 'Anticipation'],
  },
  {
    id: 'fb-community',
    platform: 'Facebook',
    title: 'Community Question',
    description: 'Start a conversation with your audience. Facebook\'s algorithm favors posts that generate comments.',
    prompt: 'Write a community-building Facebook post that asks an engaging question related to my industry, encourages followers to share their experiences or opinions, and connects back to my brand',
    tone: 'Casual',
    goal: 'Community Building',
    tags: ['Engagement', 'Algorithm-friendly'],
  },
  {
    id: 'fb-customer-story',
    platform: 'Facebook',
    title: 'Customer Story / Testimonial',
    description: 'Share a customer success story or testimonial. Social proof that builds trust and drives referrals.',
    prompt: 'Create a Facebook post sharing a customer success story or testimonial experience, highlighting the before-and-after transformation, what made the experience special, and inviting others to try it',
    tone: 'Inspirational',
    goal: 'Sales',
    tags: ['Social Proof', 'Trust'],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByPlatform(platform: Template['platform']): Template[] {
  return templates.filter((t) => t.platform === platform);
}
