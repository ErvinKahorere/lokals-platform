<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Block\StoreBlockRequest;
use App\Models\Block;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user()->blocks()->with('blockedUser:id,name,phone')->get());
    }

    public function store(StoreBlockRequest $request): JsonResponse
    {
        $block = Block::firstOrCreate([
            'user_id' => $request->user()->id,
            'blocked_user_id' => $request->integer('blocked_user_id'),
        ]);

        return response()->json($block, 201);
    }

    public function destroy(Request $request, Block $block): JsonResponse
    {
        abort_unless($block->user_id === $request->user()->id, 403);
        $block->delete();

        return response()->json(['message' => 'Block removed']);
    }
}
