# Phase 7: Content Optimization — Context

## Goal

Generated content is scored for quality with actionable improvement suggestions.

## Why This Phase

Content scoring helps users understand the quality of generated content and make improvements before publishing.

## Requirements

### Must Have

- Content scoring: readability score, hashtag relevance, CTA strength
- Improvement suggestions: actionable tips to improve content
- Score display: show scores on result cards
- Rules-based scoring (no extra LLM calls)

### Should Have

- Content quality grade (A/B/C/D/F)
- Platform-specific scoring (different criteria per platform)
- Score history: track how scores improve over time

### Nice to Have

- A/B test different versions of content
- Performance correlation (score vs actual engagement)

## Technical Approach

### Rules-Based Scoring

```typescript
// lib/scoring.ts
interface ContentScore {
  readability: number;    // 0-100
  hashtagRelevance: number; // 0-100
  ctaStrength: number;    // 0-100
  overall: number;        // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggestions: string[];
}

function scoreContent(content: GeneratedContent): ContentScore {
  const readability = calculateReadability(content.post);
  const hashtagRelevance = calculateHashtagRelevance(content.hashtags, content.post);
  const ctaStrength = calculateCtaStrength(content.callToAction);
  const overall = (readability + hashtagRelevance + ctaStrength) / 3;
  const grade = getGrade(overall);
  const suggestions = generateSuggestions(content, { readability, hashtagRelevance, ctaStrength });

  return { readability, hashtagRelevance, ctaStrength, overall, grade, suggestions };
}

// Readability: word count, sentence length, syllable count
function calculateReadability(post: string): number {
  const words = post.split(/\s+/).length;
  const sentences = post.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;

  // Optimal: 15-20 words per sentence
  let score = 100;
  if (avgWordsPerSentence > 25) score -= 30;
  if (avgWordsPerSentence > 30) score -= 20;
  if (words < 10) score -= 20; // Too short
  if (words > 280) score -= 10; // Too long for Twitter

  return Math.max(0, Math.min(100, score));
}

// Hashtag relevance: check if hashtags relate to post content
function calculateHashtagRelevance(hashtags: string[], post: string): number {
  const postWords = post.toLowerCase().split(/\s+/);
  let matches = 0;

  for (const tag of hashtags) {
    const tagWord = tag.replace('#', '').toLowerCase();
    if (postWords.some(word => word.includes(tagWord) || tagWord.includes(word))) {
      matches++;
    }
  }

  return Math.min(100, (matches / hashtags.length) * 100);
}

// CTA strength: check for action words, urgency, clarity
function calculateCtaStrength(cta: string): number {
  const actionWords = ['buy', 'shop', 'sign up', 'learn more', 'get', 'try', 'start', 'join', 'download'];
  const urgencyWords = ['now', 'today', 'limited', 'hurry', 'don\'t miss', 'last chance'];

  let score = 50; // Base score
  if (actionWords.some(w => cta.toLowerCase().includes(w))) score += 25;
  if (urgencyWords.some(w => cta.toLowerCase().includes(w))) score += 15;
  if (cta.length > 10 && cta.length < 100) score += 10; // Optimal length

  return Math.min(100, score);
}
```

### Integration with Generation

```typescript
// lib/ai.ts - enhance generateWithOpenAI
const result = await generateWithOpenAI(request);
const score = scoreContent(result);

return {
  ...result,
  score
};
```

### Database Changes

```prisma
model Content {
  // ... existing fields
  scoreReadability     Int?
  scoreHashtagRelevance Int?
  scoreCtaStrength     Int?
  scoreOverall         Int?
  scoreGrade           String? // A/B/C/D/F
}
```

## UI/UX

### Score Display

- Score badge on result cards: "Score: 85/100 (A)"
- Color-coded: A (green), B (blue), C (yellow), D (orange), F (red)
- Expandable section: "View breakdown" shows individual scores

### Suggestions

- List of 2-3 actionable suggestions below score
- Each suggestion has icon + text
- Examples:
  - "Consider adding a call-to-action"
  - "Your hashtags are relevant to the content"
  - "Sentence length is optimal for readability"

### Score History

- Track scores over time in analytics dashboard
- Show average score per platform
- Highlight improvement trends

## Open Questions

1. **Score persistence:** Should scores be stored in the database (for analytics) or computed on-the-fly (no storage, but no history)?
2. **Platform-specific scoring:** Should TikTok content be scored differently than Instagram? (e.g., TikTok favors shorter posts)

## Dependencies

- No dependencies on other phases (can run in parallel)
- Builds on existing Content model and generation pipeline

## Success Criteria

1. Each generated content item has a readability score
2. Each generated content item has a hashtag relevance score
3. Each generated content item has a CTA strength score
4. Overall score and grade are displayed on result cards
5. 2-3 actionable suggestions are shown for each post
6. Scores are calculated rules-based (no extra LLM calls)
