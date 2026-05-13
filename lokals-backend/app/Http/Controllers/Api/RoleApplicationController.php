<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleApplicationResource;
use App\Http\Resources\UserResource;
use App\Models\ModePreference;
use App\Models\RoleApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class RoleApplicationController extends Controller
{
    private const APPLICABLE_ROLES = [
        'driver',
        'courier',
        'service_provider',
        'business_owner',
        'organization_admin',
        'town_manager',
    ];

    public function myRoles(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'data' => [
                'assigned_roles' => $user->getRoleNames()->values(),
                'current_role' => $user->current_role ?: $user->getRoleNames()->first() ?: 'citizen',
            ],
        ]);
    }

    public function myModes(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles', 'roleApplications');
        $activeModes = $this->activeModesFor($user);
        $pending = $user->roleApplications()
            ->whereIn('status', ['draft', 'submitted', 'pending_review', 'changes_requested'])
            ->latest()
            ->get(['id', 'requested_role', 'status', 'rejection_reason', 'submitted_at']);

        return response()->json([
            'data' => [
                'current_mode' => $user->current_role ?: $user->getRoleNames()->first() ?: 'citizen',
                'available_modes' => $activeModes,
                'pending_modes' => $pending,
                'can_apply_for' => collect(self::APPLICABLE_ROLES)
                    ->reject(fn (string $role) => collect($activeModes)->contains($role))
                    ->values(),
            ],
        ]);
    }

    public function updateCurrentMode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'string', Rule::in(array_merge(['citizen'], self::APPLICABLE_ROLES, ['worker', 'seller', 'municipality_admin', 'super_admin', 'operator']))],
        ]);

        $user = $request->user()->load('roles', 'roleApplications');
        abort_unless(collect($this->activeModesFor($user))->contains($validated['mode']), 403, 'You cannot access this mode yet.');

        $user->update(['current_role' => $validated['mode']]);
        ModePreference::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['current_mode' => $validated['mode']]
        );

        return response()->json([
            'message' => 'Mode switched successfully.',
            'current_mode' => $validated['mode'],
            'user' => UserResource::make($user->fresh()->load(['profile', 'roles', 'preference'])),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);

        $application = RoleApplication::query()->create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'draft',
        ]);

        return response()->json([
            'message' => 'Role application saved.',
            'data' => RoleApplicationResource::make($application->load(['user', 'approver', 'approvalLogs.actor'])),
        ], 201);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return RoleApplicationResource::collection(
            $request->user()->roleApplications()->with(['approver', 'approvalLogs.actor'])->latest()->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $application = $request->user()->roleApplications()->with(['user', 'approver', 'approvalLogs.actor'])->whereKey($id)->firstOrFail();

        return response()->json([
            'data' => RoleApplicationResource::make($application),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $application = $request->user()->roleApplications()->whereKey($id)->firstOrFail();
        abort_unless(in_array($application->status, ['draft', 'changes_requested', 'rejected'], true), 422, 'Only draft or returned applications can be edited.');
        $validated = $this->validatePayload($request, $application->requested_role);

        $application->update([
            ...$validated,
            'status' => 'draft',
            'rejection_reason' => null,
            'approved_by' => null,
            'approved_at' => null,
        ]);

        return response()->json([
            'message' => 'Role application updated.',
            'data' => RoleApplicationResource::make($application->fresh()->load(['user', 'approver', 'approvalLogs.actor'])),
        ]);
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $application = $request->user()->roleApplications()->whereKey($id)->firstOrFail();
        abort_unless(in_array($application->status, ['draft', 'changes_requested', 'rejected'], true), 422, 'This application cannot be submitted.');

        $application->update([
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);
        $application->approvalLogs()->create([
            'acted_by' => $request->user()->id,
            'action' => 'submitted',
            'reason' => 'Application submitted for review.',
        ]);

        return response()->json([
            'message' => 'Role application submitted for review.',
            'data' => RoleApplicationResource::make($application->fresh()->load(['user', 'approver', 'approvalLogs.actor'])),
        ]);
    }

    private function validatePayload(Request $request, ?string $forcedRole = null): array
    {
        $rules = [
            'requested_role' => [$forcedRole ? 'sometimes' : 'required', 'string', Rule::in(self::APPLICABLE_ROLES)],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'town_id' => ['nullable', 'integer'],
            'town_name' => ['nullable', 'string', 'max:120'],
            'city_name' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'national_id_number' => ['nullable', 'string', 'max:120'],
            'license_number' => ['nullable', 'string', 'max:120'],
            'vehicle_registration' => ['nullable', 'string', 'max:120'],
            'vehicle_type' => ['nullable', 'string', 'max:120'],
            'service_category' => ['nullable', 'string', 'max:120'],
            'organisation_name' => ['nullable', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'documents' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ];

        $validated = $request->validate($rules);
        if ($forcedRole !== null) {
            $validated['requested_role'] = $forcedRole;
        }

        return $validated;
    }

    private function activeModesFor($user): array
    {
        $assigned = $user->getRoleNames()->map(fn (string $role) => match ($role) {
            'business_owner' => 'business_owner',
            'seller' => 'seller',
            'organization_representative' => 'organization_admin',
            'municipality_admin' => 'town_manager',
            default => $role,
        })->unique()->values()->all();

        $suspended = $user->roleApplications()
            ->where('status', 'suspended')
            ->pluck('requested_role')
            ->all();

        return collect(array_merge(['citizen'], $assigned))
            ->reject(fn (string $role) => in_array($role, $suspended, true))
            ->values()
            ->all();
    }
}
