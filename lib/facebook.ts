interface FacebookPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Publish a post to a Facebook Page using the Graph API.
 * Requires pages_manage_posts permission and a valid page access token.
 */
export async function publishToFacebook(
  accessToken: string,
  pageId: string,
  message: string
): Promise<FacebookPublishResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Failed to publish to Facebook',
      };
    }

    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Check if a Facebook access token is valid.
 */
export async function verifyFacebookToken(
  accessToken: string
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        valid: false,
        error: data.error?.message || 'Invalid token',
      };
    }

    return {
      valid: true,
      userId: data.id,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
