export interface ContentScore {
  readability: number;
  hashtagRelevance: number;
  ctaStrength: number;
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggestions: string[];
}

/**
 * Score content for quality with actionable suggestions.
 * Rules-based scoring (no LLM calls).
 */
export function scoreContent(content: {
  post: string;
  hashtags: string[];
  callToAction?: string;
}): ContentScore {
  const readability = calculateReadability(content.post);
  const hashtagRelevance = calculateHashtagRelevance(
    content.hashtags,
    content.post
  );
  const ctaStrength = calculateCtaStrength(content.callToAction || '');
  const overall = Math.round(
    (readability + hashtagRelevance + ctaStrength) / 3
  );
  const grade = getGrade(overall);
  const suggestions = generateSuggestions(content, {
    readability,
    hashtagRelevance,
    ctaStrength,
  });

  return {
    readability,
    hashtagRelevance,
    ctaStrength,
    overall,
    grade,
    suggestions,
  };
}

/**
 * Calculate readability score based on word count and sentence structure.
 * Optimal: 15-20 words per sentence, 10-280 words total.
 */
function calculateReadability(post: string): number {
  const words = post.split(/\s+/).filter((w) => w.length > 0).length;
  const sentences = post.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    .length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : words;

  let score = 100;

  // Penalty for sentences that are too long
  if (avgWordsPerSentence > 25) score -= 30;
  if (avgWordsPerSentence > 30) score -= 20;

  // Penalty for too short or too long content
  if (words < 10) score -= 20;
  if (words > 280) score -= 10;

  // Bonus for optimal sentence length
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate hashtag relevance by checking if hashtags relate to post content.
 */
function calculateHashtagRelevance(
  hashtags: string[],
  post: string
): number {
  if (hashtags.length === 0) return 50; // Neutral if no hashtags

  const postWords = post
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''));
  let matches = 0;

  for (const tag of hashtags) {
    const tagWord = tag.replace('#', '').toLowerCase();
    if (
      postWords.some(
        (word) => word.includes(tagWord) || tagWord.includes(word)
      )
    ) {
      matches++;
    }
  }

  return Math.min(100, Math.round((matches / hashtags.length) * 100));
}

/**
 * Calculate CTA strength based on action words, urgency, and clarity.
 */
function calculateCtaStrength(cta: string): number {
  if (!cta || cta.length === 0) return 30; // Low score for missing CTA

  const actionWords = [
    'buy',
    'shop',
    'sign up',
    'learn more',
    'get',
    'try',
    'start',
    'join',
    'download',
    'subscribe',
    'follow',
    'visit',
    'check out',
    'discover',
    'explore',
  ];

  const urgencyWords = [
    'now',
    'today',
    'limited',
    'hurry',
    "don't miss",
    'last chance',
    'exclusive',
    'free',
    'special',
    'offer',
  ];

  let score = 50; // Base score

  // Bonus for action words
  if (actionWords.some((w) => cta.toLowerCase().includes(w))) score += 25;

  // Bonus for urgency words
  if (urgencyWords.some((w) => cta.toLowerCase().includes(w))) score += 15;

  // Bonus for optimal length (10-100 characters)
  if (cta.length > 10 && cta.length < 100) score += 10;

  // Penalty for too short
  if (cta.length < 5) score -= 20;

  return Math.max(0, Math.min(100, score));
}

/**
 * Convert numeric score to letter grade.
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate actionable suggestions based on scores.
 */
function generateSuggestions(
  content: { post: string; hashtags: string[]; callToAction?: string },
  scores: { readability: number; hashtagRelevance: number; ctaStrength: number }
): string[] {
  const suggestions: string[] = [];

  // Readability suggestions
  if (scores.readability < 70) {
    const words = content.post.split(/\s+/).length;
    if (words < 15) {
      suggestions.push('Consider adding more detail to your post');
    } else if (words > 250) {
      suggestions.push('Try making your post more concise');
    } else {
      suggestions.push('Simplify sentence structure for better readability');
    }
  }

  // Hashtag suggestions
  if (scores.hashtagRelevance < 70) {
    if (content.hashtags.length < 3) {
      suggestions.push('Add more relevant hashtags to increase reach');
    } else if (content.hashtags.length > 10) {
      suggestions.push('Consider using fewer, more targeted hashtags');
    } else {
      suggestions.push(
        'Ensure hashtags are directly related to your content'
      );
    }
  }

  // CTA suggestions
  if (scores.ctaStrength < 70) {
    if (!content.callToAction || content.callToAction.length === 0) {
      suggestions.push('Add a clear call-to-action to drive engagement');
    } else {
      suggestions.push(
        'Make your CTA more action-oriented with urgency'
      );
    }
  }

  // Positive feedback if scores are good
  if (suggestions.length === 0) {
    if (scores.readability >= 80) {
      suggestions.push('Great readability! Your content is easy to understand');
    }
    if (scores.hashtagRelevance >= 80) {
      suggestions.push(
        'Excellent hashtag relevance! Your tags match your content well'
      );
    }
    if (scores.ctaStrength >= 80) {
      suggestions.push(
        'Strong call-to-action! This should drive good engagement'
      );
    }
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

/**
 * Get color class for grade display.
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-600 bg-green-100';
    case 'B':
      return 'text-blue-600 bg-blue-100';
    case 'C':
      return 'text-yellow-600 bg-yellow-100';
    case 'D':
      return 'text-orange-600 bg-orange-100';
    case 'F':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
