<?php

namespace App\Http\Resources;

use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pledges = $this->relationLoaded('pledges') ? $this->pledges : collect();
        $updates = $this->relationLoaded('updates') ? $this->updates : collect();
        $attachments = $this->relationLoaded('attachments') ? $this->attachments : collect();
        $followersCount = $this->relationLoaded('followers') ? $this->followers->count() : (int) ($this->followers_count ?? 0);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'reference_code' => $this->reference_code,
            'title' => $this->title,
            'summary' => $this->summary,
            'description' => $this->description,
            'support_needed' => $this->support_needed ?? [],
            'target_amount' => $this->target_amount,
            'target_items' => $this->target_items ?? [],
            'target_volunteers' => $this->target_volunteers,
            'current_amount' => $this->current_amount,
            'current_items' => $this->current_items ?? [],
            'current_volunteers' => $this->current_volunteers,
            'location_text' => $this->location_text,
            'town' => $this->town,
            'area' => $this->area,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'contact_name' => $this->contact_name,
            'contact_phone' => $this->contact_phone,
            'contact_whatsapp' => $this->contact_whatsapp,
            'contact_email' => $this->contact_email,
            'status' => $this->status,
            'verification_status' => $this->verification_status,
            'verification_notes' => $this->verification_notes,
            'rejection_reason' => $this->rejection_reason,
            'is_verified' => (bool) $this->is_verified,
            'is_featured' => (bool) $this->is_featured,
            'starts_at' => optional($this->starts_at)?->toIso8601String(),
            'ends_at' => optional($this->ends_at)?->toIso8601String(),
            'approved_at' => optional($this->approved_at)?->toIso8601String(),
            'completed_at' => optional($this->completed_at)?->toIso8601String(),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'category' => CommunityProjectCategoryResource::make($this->whenLoaded('category')),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => \App\Support\MediaUrl::resolve($this->user->avatar),
                'phone' => $this->user->phone,
            ] : null,
            'organization' => $this->organization ? [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'logo_url' => \App\Support\MediaUrl::resolve($this->organization->logo_url),
                'category' => $this->organization->category,
                'is_verified' => $this->organization->is_verified,
            ] : null,
            'attachments' => CommunityProjectAttachmentResource::collection($attachments),
            'updates' => CommunityProjectUpdateResource::collection($updates),
            'latest_update' => $updates->isNotEmpty() ? CommunityProjectUpdateResource::make($updates->first()) : null,
            'pledges' => CommunityProjectPledgeResource::collection($pledges),
            'pledges_count' => $pledges->count() ?: (int) ($this->pledges_count ?? 0),
            'followers_count' => $followersCount,
            'progress_percent' => $this->progress_percent ?? $this->calculateProgressPercent(),
            'is_following' => $this->is_following instanceof Follow
                ? true
                : (bool) ($this->is_following ?? false),
            'verification_history' => $this->relationLoaded('verifications')
                ? $this->verifications->map(fn ($verification) => [
                    'id' => $verification->id,
                    'action' => $verification->action,
                    'notes' => $verification->notes,
                    'status_after' => $verification->status_after,
                    'verification_status_after' => $verification->verification_status_after,
                    'created_at' => optional($verification->created_at)?->toIso8601String(),
                    'reviewer' => $verification->reviewer ? [
                        'id' => $verification->reviewer->id,
                        'name' => $verification->reviewer->name,
                    ] : null,
                ])->values()
                : [],
        ];
    }

    private function calculateProgressPercent(): int
    {
        if ((float) $this->target_amount > 0) {
            return (int) max(0, min(100, round(((float) $this->current_amount / (float) $this->target_amount) * 100)));
        }

        if ((int) $this->target_volunteers > 0) {
            return (int) max(0, min(100, round(((int) $this->current_volunteers / (int) $this->target_volunteers) * 100)));
        }

        $targetItems = collect($this->target_items ?? [])->sum(fn ($item) => (int) ($item['quantity'] ?? $item['target'] ?? 0));
        $currentItems = collect($this->current_items ?? [])->sum(fn ($item) => (int) ($item['quantity'] ?? $item['current'] ?? 0));
        if ($targetItems > 0) {
            return (int) max(0, min(100, round(($currentItems / $targetItems) * 100)));
        }

        return match ($this->status) {
            'completed' => 100,
            'fully_funded' => 100,
            'in_progress' => 65,
            'active', 'needs_support' => 35,
            default => 0,
        };
    }
}
