<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\AnalyticsService;
use App\Services\MessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function __construct(
        private readonly MessagingService $messaging,
        private readonly AnalyticsService $analytics,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $conversations = Conversation::query()
            ->whereHas('participants', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with(['participants.user', 'lastMessage.user'])
            ->orderByDesc('last_message_at')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json($conversations->through(fn (Conversation $conversation) => ConversationResource::make($conversation)->resolve()));
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless(
            $conversation->participants()->where('user_id', $request->user()->id)->exists(),
            403,
            'You are not part of this conversation.',
        );

        return response()->json([
            'data' => ConversationResource::make(
                $conversation->load(['participants.user', 'messages.user', 'messages.attachments', 'messages.readReceipts', 'lastMessage.user'])
            ),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'participant_ids' => ['required', 'array', 'min:1'],
            'participant_ids.*' => ['integer', 'exists:users,id'],
            'context' => ['nullable', 'string', 'max:50'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
            'conversationable_type' => ['nullable', 'string'],
            'conversationable_id' => ['nullable', 'integer'],
        ]);

        $conversation = $this->messaging->createConversation(
            $request->user(),
            $validated['participant_ids'],
            $validated['context'] ?? 'general',
            null,
            $validated['subject'] ?? null,
        );

        if (! empty($validated['message'])) {
            $this->messaging->sendMessage($conversation, $request->user(), $validated['message']);
        }

        $this->analytics->record($request->user(), 'conversation_created', [
            'category' => $validated['context'] ?? 'general',
            'town' => $request->user()->default_town,
        ]);

        return response()->json([
            'data' => ConversationResource::make($conversation->fresh(['participants.user', 'messages.user', 'lastMessage.user'])),
        ], 201);
    }

    public function message(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless(
            $conversation->participants()->where('user_id', $request->user()->id)->exists(),
            403,
            'You are not part of this conversation.',
        );

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'message_type' => ['nullable', 'string', 'max:30'],
        ]);

        $message = $this->messaging->sendMessage(
            $conversation->load('participants.user'),
            $request->user(),
            $validated['body'],
            $validated['message_type'] ?? 'text',
        );

        $this->analytics->record($request->user(), 'message_sent', [
            'category' => $conversation->context,
            'subject_type' => Conversation::class,
            'subject_id' => $conversation->id,
        ]);

        return response()->json([
            'data' => \App\Http\Resources\MessageResource::make($message),
        ], 201);
    }

    public function markRead(Request $request, Message $message): JsonResponse
    {
        abort_unless(
            $message->conversation()->whereHas('participants', fn ($query) => $query->where('user_id', $request->user()->id))->exists(),
            403,
            'You are not part of this conversation.',
        );

        $receipt = $this->messaging->markRead($message, $request->user());

        return response()->json([
            'message' => 'Message marked as read.',
            'data' => [
                'message_id' => $receipt->message_id,
                'user_id' => $receipt->user_id,
                'read_at' => optional($receipt->read_at)->toIso8601String(),
            ],
        ]);
    }
}
