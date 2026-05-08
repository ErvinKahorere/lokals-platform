<?php

namespace App\Http\Requests\Job;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'employment_type' => ['nullable', 'string', 'max:50'],
            'compensation' => ['nullable', 'numeric'],
            'location' => ['required', 'string', 'max:255'],
            'skills' => ['nullable', 'array'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
        ];
    }
}
