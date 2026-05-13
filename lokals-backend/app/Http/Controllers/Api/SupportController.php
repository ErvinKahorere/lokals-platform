<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageReceived;
use App\Events\SupportMessageReceived;
use App\Http\Controllers\Controller;
use App\Http\Resources\SupportConversationResource;
use App\Models\SupportConversation;
use App\Services\AnalyticsService;
use App\Services\Support\SupportBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function __construct(
        private readonly SupportBotService $supportBotService,
        private readonly AnalyticsService $analytics,
    ) {
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_id' => ['nullable', 'integer', 'exists:support_conversations,id'],
        ]);

        $conversation = isset($validated['conversation_id'])
            ? SupportConversation::query()->findOrFail($validated['conversation_id'])
            : null;

        $conversation = $this->supportBotService->reply($request->user(), $validated['message'], $conversation);
        $latestMessage = $conversation->messages()->latest()->first();
        if ($latestMessage !== null) {
            broadcast(new SupportMessageReceived($conversation, $latestMessage));
            broadcast(new MessageReceived(
                context: 'support',
                conversationId: $conversation->id,
                messageId: $latestMessage->id,
                recipientUserIds: [$conversation->user_id],
                senderUserId: $latestMessage->user_id,
                body: $latestMessage->body,
                createdAt: $latestMessage->created_at,
            ));
        }
        $this->analytics->record($request->user(), 'support_chat_message', [
            'category' => 'support',
            'subject_type' => SupportConversation::class,
            'subject_id' => $conversation->id,
        ]);

        return response()->json(['data' => SupportConversationResource::make($conversation)], 201);
    }

    public function conversations(Request $request): JsonResponse
    {
        return response()->json([
            'data' => SupportConversationResource::collection(
                SupportConversation::query()
                    ->where('user_id', $request->user()->id)
                    ->with(['messages', 'escalations'])
                    ->latest('last_message_at')
                    ->get()
            ),
        ]);
    }

    public function show(Request $request, SupportConversation $conversation): SupportConversationResource
    {
        abort_if($conversation->user_id !== $request->user()->id && ! $request->user()->hasTownManagerAccess(), 403);

        return SupportConversationResource::make($conversation->load(['messages', 'escalations']));
    }

    public function message(Request $request, SupportConversation $conversation): JsonResponse
    {
        abort_if($conversation->user_id !== $request->user()->id && ! $request->user()->hasTownManagerAccess(), 403);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $conversation = $this->supportBotService->reply($request->user(), $validated['message'], $conversation);
        $latestMessage = $conversation->messages()->latest()->first();
        if ($latestMessage !== null) {
            broadcast(new SupportMessageReceived($conversation, $latestMessage));
            broadcast(new MessageReceived(
                context: 'support',
                conversationId: $conversation->id,
                messageId: $latestMessage->id,
                recipientUserIds: [$conversation->user_id],
                senderUserId: $latestMessage->user_id,
                body: $latestMessage->body,
                createdAt: $latestMessage->created_at,
            ));
        }
        $this->analytics->record($request->user(), 'support_conversation_reply', [
            'category' => 'support',
            'subject_type' => SupportConversation::class,
            'subject_id' => $conversation->id,
        ]);

        return response()->json(['data' => SupportConversationResource::make($conversation)], 201);
    }

    public function escalate(Request $request, SupportConversation $conversation): JsonResponse
    {
        abort_if($conversation->user_id !== $request->user()->id && ! $request->user()->hasTownManagerAccess(), 403);
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $escalation = $this->supportBotService->escalate(
            $conversation,
            $validated['reason'],
            $request->user(),
            $validated['notes'] ?? null
        );

        return response()->json(['data' => $escalation], 201);
    }
}
