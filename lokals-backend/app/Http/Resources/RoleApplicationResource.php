<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'requested_role' => $this->requested_role,
            'status' => $this->status,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'town_id' => $this->town_id,
            'town_name' => $this->town_name,
            'city_name' => $this->city_name,
            'address' => $this->address,
            'national_id_number' => $this->national_id_number,
            'license_number' => $this->license_number,
            'vehicle_registration' => $this->vehicle_registration,
            'vehicle_type' => $this->vehicle_type,
            'service_category' => $this->service_category,
            'organisation_name' => $this->organisation_name,
            'business_name' => $this->business_name,
            'documents' => $this->documents ?? [],
            'notes' => $this->notes,
            'rejection_reason' => $this->rejection_reason,
            'approved_at' => optional($this->approved_at)->toIso8601String(),
            'submitted_at' => optional($this->submitted_at)->toIso8601String(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'phone' => $this->user?->phone,
                'email' => $this->user?->email,
            ]),
            'approver' => $this->whenLoaded('approver', fn () => [
                'id' => $this->approver?->id,
                'name' => $this->approver?->name,
            ]),
            'approval_logs' => $this->whenLoaded('approvalLogs', fn () => $this->approvalLogs->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'reason' => $log->reason,
                'metadata' => $log->metadata,
                'created_at' => optional($log->created_at)->toIso8601String(),
                'actor' => $log->relationLoaded('actor') ? [
                    'id' => $log->actor?->id,
                    'name' => $log->actor?->name,
                ] : null,
            ])->values()),
        ];
    }
}
