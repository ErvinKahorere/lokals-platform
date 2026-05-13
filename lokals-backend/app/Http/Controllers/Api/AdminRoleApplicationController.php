<?php

namespace App\Http\Controllers\Api;

use App\Events\RoleApplicationSubmitted;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoleApplicationResource;
use App\Models\CourierProfile;
use App\Models\DriverProfile;
use App\Models\ModePreference;
use App\Models\RoleApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class AdminRoleApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return RoleApplicationResource::collection(
            RoleApplication::query()
                ->with(['user', 'approver', 'approvalLogs.actor'])
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
                ->when($request->filled('role'), fn ($query) => $query->where('requested_role', $request->string('role')))
                ->latest()
                ->paginate((int) $request->integer('per_page', 20))
        );
    }

    public function show(int $id): JsonResponse
    {
        $application = RoleApplication::query()->with(['user', 'approver', 'approvalLogs.actor'])->whereKey($id)->firstOrFail();

        return response()->json([
            'data' => RoleApplicationResource::make($application),
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $application = RoleApplication::query()->with('user')->whereKey($id)->firstOrFail();
        abort_unless(in_array($application->status, ['submitted', 'pending_review', 'changes_requested'], true), 422, 'This application is not awaiting approval.');

        $application->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        Role::findOrCreate($application->requested_role, 'sanctum');
        $application->user->assignRole([$application->requested_role]);
        if (! $application->user->current_role) {
            $application->user->update(['current_role' => $application->requested_role]);
        }
        ModePreference::query()->updateOrCreate(
            ['user_id' => $application->user_id],
            ['current_mode' => $application->user->current_role ?: $application->requested_role]
        );

        if ($application->requested_role === 'driver') {
            DriverProfile::query()->updateOrCreate(
                ['user_id' => $application->user_id],
                [
                    'role_application_id' => $application->id,
                    'license_number' => $application->license_number,
                    'vehicle_registration' => $application->vehicle_registration,
                    'vehicle_type' => $application->vehicle_type,
                    'is_verified' => true,
                ]
            );
        }

        if ($application->requested_role === 'courier') {
            CourierProfile::query()->updateOrCreate(
                ['user_id' => $application->user_id],
                [
                    'role_application_id' => $application->id,
                    'license_number' => $application->license_number,
                    'vehicle_registration' => $application->vehicle_registration,
                    'vehicle_type' => $application->vehicle_type,
                    'is_verified' => true,
                ]
            );
        }

        $application->approvalLogs()->create([
            'acted_by' => $request->user()->id,
            'action' => 'approved',
            'reason' => 'Application approved and role activated.',
        ]);
        broadcast(new RoleApplicationSubmitted(
            $application->fresh(),
            $application->town_name ?? $application->city_name ?? $application->user->default_town
        ));

        return response()->json([
            'message' => 'Role application approved.',
            'data' => RoleApplicationResource::make($application->fresh()->load(['user', 'approver', 'approvalLogs.actor'])),
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $application = RoleApplication::query()->whereKey($id)->firstOrFail();
        $validated = $request->validate(['reason' => ['required', 'string', 'max:2000']]);

        $application->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'approved_by' => $request->user()->id,
        ]);
        $application->approvalLogs()->create([
            'acted_by' => $request->user()->id,
            'action' => 'rejected',
            'reason' => $validated['reason'],
        ]);
        broadcast(new RoleApplicationSubmitted(
            $application->fresh(),
            $application->town_name ?? $application->city_name ?? $application->user?->default_town
        ));

        return response()->json([
            'message' => 'Role application rejected.',
            'data' => RoleApplicationResource::make($application->fresh()->load(['user', 'approver', 'approvalLogs.actor'])),
        ]);
    }

    public function requestChanges(Request $request, int $id): JsonResponse
    {
        $application = RoleApplication::query()->whereKey($id)->firstOrFail();
        $validated = $request->validate(['reason' => ['required', 'string', 'max:2000']]);

        $application->update([
            'status' => 'changes_requested',
            'rejection_reason' => $validated['reason'],
            'approved_by' => $request->user()->id,
        ]);
        $application->approvalLogs()->create([
            'acted_by' => $request->user()->id,
            'action' => 'changes_requested',
            'reason' => $validated['reason'],
        ]);
        broadcast(new RoleApplicationSubmitted(
            $application->fresh(),
            $application->town_name ?? $application->city_name ?? $application->user?->default_town
        ));

        return response()->json([
            'message' => 'Changes requested for role application.',
            'data' => RoleApplicationResource::make($application->fresh()->load(['user', 'approver', 'approvalLogs.actor'])),
        ]);
    }

    public function suspendUserRole(Request $request, int $userId, string $role): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', Rule::in(['suspended'])],
        ]);

        $user = User::query()->with('roleApplications')->whereKey($userId)->firstOrFail();
        abort_unless($user->hasRole($role), 404, 'User does not have this role.');

        $user->removeRole($role);
        if ($user->current_role === $role) {
            $fallback = $user->getRoleNames()->first() ?: 'citizen';
            $user->update(['current_role' => $fallback]);
            ModePreference::query()->updateOrCreate(
                ['user_id' => $user->id],
                ['current_mode' => $fallback]
            );
        }

        $application = $user->roleApplications()->where('requested_role', $role)->latest()->first();
        if ($application) {
            $application->update([
                'status' => 'suspended',
                'rejection_reason' => $validated['reason'] ?? 'Role suspended by administrator.',
                'approved_by' => $request->user()->id,
            ]);
            $application->approvalLogs()->create([
                'acted_by' => $request->user()->id,
                'action' => 'suspended',
                'reason' => $validated['reason'] ?? 'Role suspended.',
            ]);
            broadcast(new RoleApplicationSubmitted(
                $application->fresh(),
                $application->town_name ?? $application->city_name ?? $user->default_town
            ));
        }

        return response()->json([
            'message' => 'Role suspended successfully.',
        ]);
    }
}
