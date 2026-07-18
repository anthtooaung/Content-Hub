interface InstagramPublishResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

/**
 * Publish a post to Instagram using the Content Publishing API.
 * Two-step process: create media container, then publish.
 * Requires instagram_basic and instagram_content_publish permissions.
 */
export async function publishToInstagram(
  accessToken: string,
  igUserId: string,
  imageUrl: string,
  caption: string
): Promise<InstagramPublishResult> {
  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      return {
        success: false,
        error: containerData.error?.message || 'Failed to create media container',
      };
    }

    const creationId = containerData.id;

    // Step 2: Publish the media container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      return {
        success: false,
        error: publishData.error?.message || 'Failed to publish media',
      };
    }

    return {
      success: true,
      mediaId: publishData.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Check if an Instagram access token is valid.
 */
export async function verifyInstagramToken(
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
