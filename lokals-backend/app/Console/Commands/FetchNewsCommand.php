<?php

namespace App\Console\Commands;

use App\Services\NewsAggregationService;
use Illuminate\Console\Command;

class FetchNewsCommand extends Command
{
    protected $signature = 'lokals:fetch-news';

    protected $description = 'Fetch and normalize local news items from active sources.';

    public function handle(NewsAggregationService $service): int
    {
        $items = $service->fetchActiveSources();

        $this->info('Fetched '.count($items).' news item(s).');

        return self::SUCCESS;
    }
}
