<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'employment_type' => $this->employment_type,
            'compensation' => $this->compensation,
            'location' => $this->location,
            'status' => $this->status,
            'skills' => $this->skills,
            'organization' => $this->organization?->only(['id', 'name', 'category']),
            'user' => $this->user?->only(['id', 'name', 'phone']),
            'applications_count' => $this->whenCounted('applications'),
        ];
    }
}
