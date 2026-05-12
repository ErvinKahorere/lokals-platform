class CommunityImpactBadgeModel {
  const CommunityImpactBadgeModel({
    required this.title,
    this.description,
    this.icon,
    this.pointsThreshold,
  });

  final String title;
  final String? description;
  final String? icon;
  final int? pointsThreshold;

  factory CommunityImpactBadgeModel.fromJson(Map<String, dynamic>? json) {
    return CommunityImpactBadgeModel(
      title: json?['title']?.toString() ?? 'Community badge',
      description: json?['description']?.toString(),
      icon: json?['icon']?.toString(),
      pointsThreshold: (json?['points_threshold'] as num?)?.toInt(),
    );
  }
}

class CommunityImpactAccountModel {
  const CommunityImpactAccountModel({
    required this.availablePoints,
    required this.lifetimePoints,
    required this.totalPoints,
    required this.redeemedPoints,
    required this.currentLevel,
    required this.publicLeaderboardOptIn,
    required this.privacyMode,
    this.publicDisplayName,
    this.currentBadge,
    this.nextBadge,
  });

  final int availablePoints;
  final int lifetimePoints;
  final int totalPoints;
  final int redeemedPoints;
  final String currentLevel;
  final bool publicLeaderboardOptIn;
  final String privacyMode;
  final String? publicDisplayName;
  final CommunityImpactBadgeModel? currentBadge;
  final CommunityImpactBadgeModel? nextBadge;

  factory CommunityImpactAccountModel.fromJson(Map<String, dynamic>? json) {
    return CommunityImpactAccountModel(
      availablePoints: (json?['available_points'] as num?)?.toInt() ?? 0,
      lifetimePoints: (json?['lifetime_points'] as num?)?.toInt() ?? 0,
      totalPoints: (json?['total_points'] as num?)?.toInt() ?? 0,
      redeemedPoints: (json?['redeemed_points'] as num?)?.toInt() ?? 0,
      currentLevel: json?['current_level']?.toString() ?? 'Neighbor',
      publicLeaderboardOptIn: json?['public_leaderboard_opt_in'] == true,
      privacyMode: json?['privacy_mode']?.toString() ?? 'private',
      publicDisplayName: json?['public_display_name']?.toString(),
      currentBadge: json?['current_badge'] is Map<String, dynamic>
          ? CommunityImpactBadgeModel.fromJson(
              (json?['current_badge'] as Map<String, dynamic>)['data'] is Map<String, dynamic>
                  ? (json?['current_badge'] as Map<String, dynamic>)['data'] as Map<String, dynamic>
                  : json?['current_badge'] as Map<String, dynamic>,
            )
          : null,
      nextBadge: json?['next_badge'] is Map<String, dynamic>
          ? CommunityImpactBadgeModel.fromJson(
              (json?['next_badge'] as Map<String, dynamic>)['data'] is Map<String, dynamic>
                  ? (json?['next_badge'] as Map<String, dynamic>)['data'] as Map<String, dynamic>
                  : json?['next_badge'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}

class CommunityImpactTransactionModel {
  const CommunityImpactTransactionModel({
    required this.id,
    required this.points,
    required this.type,
    required this.reason,
    required this.category,
    required this.verificationStatus,
    this.publicSummary,
    this.internalNotes,
    this.verifiedAt,
    this.createdAt,
  });

  final int id;
  final int points;
  final String type;
  final String reason;
  final String category;
  final String verificationStatus;
  final String? publicSummary;
  final String? internalNotes;
  final String? verifiedAt;
  final String? createdAt;

  factory CommunityImpactTransactionModel.fromJson(Map<String, dynamic> json) {
    return CommunityImpactTransactionModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      points: (json['points'] as num?)?.toInt() ?? 0,
      type: json['type']?.toString() ?? 'earned',
      reason: json['reason']?.toString() ?? 'Community Impact update',
      category: json['category']?.toString() ?? 'general',
      verificationStatus: json['verification_status']?.toString() ?? 'pending',
      publicSummary: json['public_summary']?.toString(),
      internalNotes: json['internal_notes']?.toString(),
      verifiedAt: json['verified_at']?.toString(),
      createdAt: json['created_at']?.toString(),
    );
  }
}

class CommunityImpactRewardModel {
  const CommunityImpactRewardModel({
    required this.id,
    required this.title,
    required this.rewardType,
    required this.pointsRequired,
    required this.isActive,
    this.description,
    this.quantityAvailable,
    this.sponsorName,
  });

  final int id;
  final String title;
  final String rewardType;
  final int pointsRequired;
  final bool isActive;
  final String? description;
  final int? quantityAvailable;
  final String? sponsorName;

  factory CommunityImpactRewardModel.fromJson(Map<String, dynamic> json) {
    return CommunityImpactRewardModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: json['title']?.toString() ?? 'Reward',
      rewardType: json['reward_type']?.toString() ?? 'other',
      pointsRequired: (json['points_required'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] == true,
      description: json['description']?.toString(),
      quantityAvailable: (json['quantity_available'] as num?)?.toInt(),
      sponsorName: json['sponsor_name']?.toString(),
    );
  }
}

class CommunityImpactRedemptionModel {
  const CommunityImpactRedemptionModel({
    required this.id,
    required this.pointsSpent,
    required this.status,
    this.fulfillmentNotes,
    this.reward,
    this.createdAt,
  });

  final int id;
  final int pointsSpent;
  final String status;
  final String? fulfillmentNotes;
  final CommunityImpactRewardModel? reward;
  final String? createdAt;

  factory CommunityImpactRedemptionModel.fromJson(Map<String, dynamic> json) {
    final rewardJson = json['reward'] is Map<String, dynamic>
        ? ((json['reward'] as Map<String, dynamic>)['data'] is Map<String, dynamic>
              ? (json['reward'] as Map<String, dynamic>)['data'] as Map<String, dynamic>
              : json['reward'] as Map<String, dynamic>)
        : null;

    return CommunityImpactRedemptionModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      pointsSpent: (json['points_spent'] as num?)?.toInt() ?? 0,
      status: json['status']?.toString() ?? 'requested',
      fulfillmentNotes: json['fulfillment_notes']?.toString(),
      createdAt: json['created_at']?.toString(),
      reward: rewardJson == null ? null : CommunityImpactRewardModel.fromJson(rewardJson),
    );
  }
}

class CommunityImpactLeaderboardEntryModel {
  const CommunityImpactLeaderboardEntryModel({
    required this.rank,
    required this.displayName,
    required this.points,
    required this.level,
    this.avatarPlaceholder,
  });

  final int rank;
  final String displayName;
  final int points;
  final String level;
  final String? avatarPlaceholder;

  factory CommunityImpactLeaderboardEntryModel.fromJson(Map<String, dynamic> json) {
    return CommunityImpactLeaderboardEntryModel(
      rank: (json['rank'] as num?)?.toInt() ?? 0,
      displayName: json['display_name']?.toString() ?? 'Resident',
      points: (json['points'] as num?)?.toInt() ?? 0,
      level: json['level']?.toString() ?? 'Neighbor',
      avatarPlaceholder: json['avatar_placeholder']?.toString(),
    );
  }
}

class CommunityImpactDashboardModel {
  const CommunityImpactDashboardModel({
    required this.account,
    required this.recentApproved,
    required this.pendingTransactions,
  });

  final CommunityImpactAccountModel account;
  final List<CommunityImpactTransactionModel> recentApproved;
  final List<CommunityImpactTransactionModel> pendingTransactions;
}
