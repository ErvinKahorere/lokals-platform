<?php

namespace App\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class QueryService
{
    public function paginateCollection(Collection $items, int $perPage = 12, ?int $page = null): LengthAwarePaginator
    {
        $page ??= LengthAwarePaginator::resolveCurrentPage();
        $total = $items->count();
        $results = $items->forPage($page, $perPage)->values();

        return new LengthAwarePaginator(
            $results,
            $total,
            $perPage,
            $page,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => request()->query(),
            ],
        );
    }
}
