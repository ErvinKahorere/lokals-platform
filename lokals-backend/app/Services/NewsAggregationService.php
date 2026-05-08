<?php

namespace App\Services;

use App\Models\NewsItem;
use App\Models\NewsSource;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class NewsAggregationService
{
    private const TOWN_KEYWORDS = [
        'Windhoek' => ['windhoek', 'khomasdal', 'katutura', 'klein windhoek', 'eros', 'olympia', 'wanaheda', 'khomas'],
        'Swakopmund' => ['swakopmund', 'walvis bay', 'erongo'],
        'Oshakati' => ['oshakati', 'oshana'],
        'Rundu' => ['rundu', 'kavango'],
    ];

    public function __construct(
        private readonly ?HttpFactory $http = null,
    ) {
    }

    public function fetchActiveSources(): array
    {
        return $this->fetchSources(NewsSource::query()->where('is_active', true)->get());
    }

    public function fetchSource(NewsSource $source): array
    {
        return $this->fetchSources(collect([$source]));
    }

    /**
     * @param Collection<int, NewsSource> $sources
     * @return array<int, array<string, mixed>>
     */
    public function fetchSources(Collection $sources): array
    {
        $stored = [];

        foreach ($sources as $source) {
            $payloads = $this->pullSourceItems($source);

            foreach ($payloads as $payload) {
                $stored[] = NewsItem::query()->updateOrCreate(
                    ['external_url' => $payload['external_url']],
                    $payload
                );
            }

            $source->forceFill(['last_fetched_at' => now()])->save();
        }

        return $stored;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pullSourceItems(NewsSource $source): array
    {
        $url = $source->feed_url ?: $source->website_url;
        if (! $url) {
            return [];
        }

        $response = $this->httpClient()->timeout(20)
            ->accept('application/rss+xml, application/atom+xml, application/xml, text/xml, text/html')
            ->get($url);

        if (! $response->successful()) {
            return [];
        }

        return $this->normalizeFeed($source, $response->body());
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function normalizeFeed(NewsSource $source, string $xml): array
    {
        libxml_use_internal_errors(true);
        $feed = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
        if (! $feed) {
            return [];
        }

        $items = [];
        $entries = [];

        if (isset($feed->channel->item)) {
            $entries = $feed->channel->item;
        } elseif (isset($feed->entry)) {
            $entries = $feed->entry;
        }

        foreach ($entries as $entry) {
            $item = $this->normalizeEntry($source, $entry);
            if ($item !== null) {
                $items[] = $item;
            }
        }

        return $items;
    }

    private function httpClient(): HttpFactory
    {
        return $this->http ?? app(HttpFactory::class);
    }

    /**
     * @param \SimpleXMLElement $entry
     * @return array<string, mixed>|null
     */
    private function normalizeEntry(NewsSource $source, \SimpleXMLElement $entry): ?array
    {
        $title = trim((string) ($entry->title ?? ''));
        $externalUrl = $this->extractUrl($entry);
        if ($title === '' || $externalUrl === null) {
            return null;
        }

        $summary = $this->buildSummary((string) ($entry->description ?? $entry->summary ?? $entry->content ?? ''));
        [$town, $area, $region] = $this->resolveLocation(
            $title.' '.$summary.' '.((string) ($entry->category ?? '')).' '.$source->town.' '.$source->region
        );
        $category = $this->classifyCategory((string) ($entry->category ?? ''), $title.' '.$summary, $source->source_type);
        $publishedAt = $this->resolveDate((string) ($entry->pubDate ?? $entry->published ?? $entry->updated ?? ''));
        $imageUrl = $this->extractImage($entry);
        $tags = $this->extractTags($entry, $category, $town, $region);

        return [
            'news_source_id' => $source->id,
            'title' => Str::limit($title, 255, ''),
            'summary' => $summary,
            'source_name' => $source->name,
            'source_url' => $source->website_url,
            'external_url' => $externalUrl,
            'image_url' => $imageUrl,
            'category' => $category,
            'town' => $town ?? $source->town,
            'area' => $area,
            'region' => $region ?? $source->region,
            'tags' => $tags,
            'published_at' => $publishedAt,
            'fetched_at' => now(),
            'source_type' => $source->source_type,
        ];
    }

    private function buildSummary(string $raw): string
    {
        $summary = Str::of(strip_tags($raw))
            ->replaceMatches('/\s+/', ' ')
            ->trim()
            ->value();

        if ($summary === '') {
            return 'Read the full story from the original publisher for the latest update.';
        }

        return Str::limit($summary, 280);
    }

    private function extractUrl(\SimpleXMLElement $entry): ?string
    {
        $link = trim((string) ($entry->link ?? ''));
        if ($link !== '') {
            return $link;
        }

        if (isset($entry->link['href'])) {
            return trim((string) $entry->link['href']);
        }

        foreach ($entry->link ?? [] as $candidate) {
            if (isset($candidate['href'])) {
                return trim((string) $candidate['href']);
            }
        }

        return null;
    }

    private function extractImage(\SimpleXMLElement $entry): ?string
    {
        $namespaces = $entry->getNamespaces(true);

        if (isset($namespaces['media'])) {
            $media = $entry->children($namespaces['media']);
            if (isset($media->content[0]['url'])) {
                return trim((string) $media->content[0]['url']);
            }
            if (isset($media->thumbnail[0]['url'])) {
                return trim((string) $media->thumbnail[0]['url']);
            }
        }

        if (isset($entry->enclosure['url'])) {
            return trim((string) $entry->enclosure['url']);
        }

        preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', (string) ($entry->description ?? ''), $matches);

        return $matches[1] ?? null;
    }

    /**
     * @return array{0: string|null, 1: string|null, 2: string|null}
     */
    private function resolveLocation(string $text): array
    {
        $haystack = Str::lower($text);

        foreach (self::TOWN_KEYWORDS as $town => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($haystack, Str::lower($keyword))) {
                    $region = $town === 'Windhoek' ? 'Khomas' : ($town === 'Swakopmund' ? 'Erongo' : null);
                    $area = $town === 'Windhoek' && str_contains($haystack, 'katutura') ? 'Katutura' : null;

                    return [$town, $area, $region];
                }
            }
        }

        return [null, null, null];
    }

    private function classifyCategory(string $category, string $text, string $sourceType): string
    {
        $needle = Str::lower($category.' '.$text);

        return match (true) {
            str_contains($needle, 'sport') => 'sports',
            str_contains($needle, 'business') || str_contains($needle, 'market') || str_contains($needle, 'econom') => 'business',
            str_contains($needle, 'politic') || str_contains($needle, 'government') || $sourceType === 'municipality' => 'government',
            str_contains($needle, 'traffic') || str_contains($needle, 'road') || str_contains($needle, 'transport') => 'transport',
            str_contains($needle, 'crime') || str_contains($needle, 'police') || str_contains($needle, 'safety') => 'safety',
            str_contains($needle, 'health') || str_contains($needle, 'clinic') || str_contains($needle, 'hospital') => 'health',
            str_contains($needle, 'school') || str_contains($needle, 'education') => 'education',
            str_contains($needle, 'weather') || str_contains($needle, 'storm') => 'weather',
            str_contains($needle, 'job') || str_contains($needle, 'employment') => 'jobs',
            default => $category !== '' ? Str::slug($category, '_') : 'community',
        };
    }

    private function resolveDate(string $raw): ?Carbon
    {
        if (trim($raw) === '') {
            return null;
        }

        try {
            return Carbon::parse($raw);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return list<string>
     */
    private function extractTags(\SimpleXMLElement $entry, string $category, ?string $town, ?string $region): array
    {
        $tags = collect();

        if (isset($entry->category)) {
            foreach ($entry->category as $categoryNode) {
                $value = trim((string) $categoryNode);
                if ($value !== '') {
                    $tags->push(Str::lower($value));
                }
            }
        }

        $tags->push(Str::lower(str_replace('_', ' ', $category)));
        if ($town) {
            $tags->push(Str::lower($town));
        }
        if ($region) {
            $tags->push(Str::lower($region));
        }

        return $tags
            ->filter()
            ->map(fn (string $tag) => Str::limit($tag, 32, ''))
            ->unique()
            ->values()
            ->all();
    }
}
