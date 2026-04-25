<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'bio' => ['nullable', 'string'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'secondary_phone' => ['nullable', 'string', 'max:30'],
            'profession' => ['nullable', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'default_town' => ['nullable', 'string', 'max:255'],
            'default_area' => ['nullable', 'string', 'max:255'],
            'service_radius' => ['nullable', 'integer', 'min:1', 'max:100'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'max:100'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'max:100'],
            'notification_preferences' => ['nullable', 'array'],
            'profile_visibility' => ['nullable', 'in:public,private'],
            'preferred_language' => ['nullable', 'string', 'max:100'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'avatar_url' => ['nullable', 'url'],
        ];
    }
}
