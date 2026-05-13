<?php

namespace App\Services\AiAssist;

interface AiAssistProvider
{
    public function key(): string;

    public function suggest(string $module, array $payload): array;
}
