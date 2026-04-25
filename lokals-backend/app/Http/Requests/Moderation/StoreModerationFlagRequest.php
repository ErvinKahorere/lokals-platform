<?php

namespace App\Http\Requests\Moderation;

use Illuminate\Foundation\Http\FormRequest;

class StoreModerationFlagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string'],
            'id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ];
    }
}
