<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected string $guard_name = 'sanctum';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'location',
        'lat',
        'lng',
        'status',
        'avatar',
        'bio',
        'whatsapp',
        'secondary_phone',
        'profession',
        'business_name',
        'default_town',
        'default_area',
        'service_radius',
        'current_role',
        'profile_visibility',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'lat' => 'float',
            'lng' => 'float',
            'profile_visibility' => 'string',
            'service_radius' => 'integer',
            'current_role' => 'string',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function savedAddresses(): HasMany
    {
        return $this->hasMany(SavedAddress::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function jobPosts(): HasMany
    {
        return $this->hasMany(JobPost::class);
    }

    public function deliveryRequests(): HasMany
    {
        return $this->hasMany(DeliveryRequest::class);
    }

    public function rideRequests(): HasMany
    {
        return $this->hasMany(RideRequest::class);
    }

    public function sosAlerts(): HasMany
    {
        return $this->hasMany(SosAlert::class);
    }

    public function safetyReports(): HasMany
    {
        return $this->hasMany(SafetyReport::class);
    }

    public function workerProfile(): HasOne
    {
        return $this->hasOne(WorkerProfile::class);
    }

    public function cityReports(): HasMany
    {
        return $this->hasMany(CityReport::class);
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function follows(): HasMany
    {
        return $this->hasMany(Follow::class);
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(Block::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function preference(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    public function ownedOrganizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'owner_user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function accommodations(): HasMany
    {
        return $this->hasMany(Accommodation::class);
    }

    public function notificationsFeed(): HasMany
    {
        return $this->hasMany(DatabaseNotification::class);
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class);
    }

    public function communityProjects(): HasMany
    {
        return $this->hasMany(CommunityProject::class);
    }

    public function communityProjectPledges(): HasMany
    {
        return $this->hasMany(CommunityProjectPledge::class);
    }

    public function postDrafts(): HasMany
    {
        return $this->hasMany(PostDraft::class);
    }

    public function communityImpactAccount(): HasOne
    {
        return $this->hasOne(CommunityImpactAccount::class);
    }

    public function communityImpactTransactions(): HasMany
    {
        return $this->hasMany(CommunityImpactTransaction::class);
    }

    public function communityImpactRedemptions(): HasMany
    {
        return $this->hasMany(CommunityImpactRedemption::class);
    }

    public function feedPreference(): HasOne
    {
        return $this->hasOne(UserFeedPreference::class);
    }

    public function supportConversations(): HasMany
    {
        return $this->hasMany(SupportConversation::class);
    }

    public function aiAssistRequests(): HasMany
    {
        return $this->hasMany(AiAssistRequest::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function analyticsEvents(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class);
    }

    public function engagementMetrics(): HasMany
    {
        return $this->hasMany(UserEngagementMetric::class);
    }

    public function blockedUsers(): HasMany
    {
        return $this->hasMany(BlockedUser::class);
    }

    public function trustMetrics(): HasMany
    {
        return $this->hasMany(UserTrustMetric::class);
    }

    public function verificationRequests(): HasMany
    {
        return $this->hasMany(VerificationRequest::class);
    }

    public function hasTownManagerRole(): bool
    {
        return $this->hasAnyRole(['town_manager', 'municipality_admin']);
    }

    public function hasTownManagerAccess(): bool
    {
        return $this->hasAnyRole(['town_manager', 'municipality_admin', 'super_admin']);
    }
}
