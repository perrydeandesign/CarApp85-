// Minimal Reddit fetcher — pulls top image posts from a subreddit using
// the public .json endpoint. No auth required for low-volume reads.

export type RedditImage = {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  author: string;
  ups: number;
  permalink: string;
};

type RedditChild = {
  data: {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    title: string;
    author: string;
    ups: number;
    permalink: string;
    post_hint?: string;
    is_video?: boolean;
    over_18?: boolean;
  };
};

type RedditListing = {
  data: { children: RedditChild[] };
};

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)(\?.*)?$/i;

function isDirectImage(url: string, postHint?: string): boolean {
  if (postHint === 'image') return true;
  if (IMAGE_EXT.test(url)) return true;
  if (/^https:\/\/i\.redd\.it\//.test(url)) return true;
  return false;
}

/**
 * Fetch top image posts from a subreddit. Filters to direct image URLs only
 * (skips galleries, videos, external links, NSFW posts).
 *
 * Reddit requires a custom User-Agent; the default RN one gets 429s frequently.
 */
export async function fetchSubredditImages(
  subreddit: string,
  limit = 15,
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all' = 'month',
): Promise<RedditImage[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(
    subreddit,
  )}/top.json?limit=${limit}&t=${timeRange}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'CarApp/1.0 (mobile)',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Reddit /r/${subreddit} returned ${res.status}`);
  }

  const json = (await res.json()) as RedditListing;
  const items = (json.data?.children ?? [])
    .map((c) => c.data)
    .filter((d) => !d.over_18 && !d.is_video && isDirectImage(d.url, d.post_hint))
    .map<RedditImage>((d) => ({
      id: d.id,
      url: d.url,
      thumbnail:
        d.thumbnail && /^https:\/\//.test(d.thumbnail)
          ? d.thumbnail
          : d.url,
      title: d.title,
      author: d.author,
      ups: d.ups,
      permalink: `https://reddit.com${d.permalink}`,
    }));

  return items;
}
