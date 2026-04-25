<?php

namespace App\Http\Requests\Block;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blocked_user_id' => ['required', 'exists:users,id', 'different:user_id'],
        ];
    }
}
