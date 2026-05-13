<?php

namespace App\Services\Support;

use App\Models\SupportConversation;
use App\Models\SupportEscalation;
use App\Models\SupportIntent;
use App\Models\SupportKnowledgeBaseArticle;
use App\Models\SupportMessage;
use App\Models\User;

class SupportBotService
{
    public function reply(?User $user, string $message, ?SupportConversation $conversation = null): SupportConversation
    {
        $conversation ??= SupportConversation::query()->create([
            'user_id' => $user?->id,
            'channel' => 'in_app',
            'status' => 'open',
            'topic' => 'General support',
            'last_message_at' => now(),
        ]);

        $conversation->messages()->create([
            'user_id' => $user?->id,
            'sender_type' => 'user',
            'body' => $message,
        ]);

        [$intent, $article] = $this->matchIntent($message);
        $body = $article?->summary
            ?? $intent?->response_template
            ?? 'I can help with reports, services, rides, deliveries, and town contacts. Tell me what you need.';

        $conversation->messages()->create([
            'sender_type' => 'bot',
            'body' => $body,
            'intent_key' => $intent?->key,
            'metadata' => [
                'route_hint' => $article?->route_hint ?? $intent?->suggested_route,
                'article_id' => $article?->id,
            ],
        ]);

        $conversation->forceFill([
            'topic' => $intent?->name ?? $conversation->topic,
            'last_message_at' => now(),
        ])->save();

        return $conversation->load(['messages', 'escalations']);
    }

    public function escalate(SupportConversation $conversation, string $reason, ?User $actor = null, ?string $notes = null): SupportEscalation
    {
        $conversation->update([
            'status' => 'pending_human',
            'last_message_at' => now(),
        ]);

        return $conversation->escalations()->create([
            'reason' => $reason,
            'status' => 'pending',
            'notes' => $notes,
            'assigned_to' => null,
            'resolved_by' => null,
        ]);
    }

    private function matchIntent(string $message): array
    {
        $lower = mb_strtolower($message);
        $intent = SupportIntent::query()
            ->where('is_active', true)
            ->get()
            ->first(function (SupportIntent $candidate) use ($lower): bool {
                foreach ($candidate->training_phrases ?? [] as $phrase) {
                    if ($phrase !== '' && str_contains($lower, mb_strtolower($phrase))) {
                        return true;
                    }
                }

                return str_contains($lower, mb_strtolower($candidate->key));
            });

        $article = SupportKnowledgeBaseArticle::query()
            ->where('is_published', true)
            ->orderByDesc('priority')
            ->get()
            ->first(function (SupportKnowledgeBaseArticle $candidate) use ($lower): bool {
                return str_contains($lower, mb_strtolower($candidate->title))
                    || collect($candidate->tags ?? [])->contains(fn ($tag) => str_contains($lower, mb_strtolower((string) $tag)));
            });

        return [$intent, $article];
    }
}
