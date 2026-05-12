import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import 'community_impact_models.dart';

final communityImpactRepositoryProvider = Provider<CommunityImpactRepository>((ref) {
  return CommunityImpactRepository(ref);
});

final communityImpactDashboardProvider = FutureProvider<CommunityImpactDashboardModel>((ref) async {
  return ref.read(communityImpactRepositoryProvider).fetchDashboard();
});

final communityImpactTransactionsProvider = FutureProvider<List<CommunityImpactTransactionModel>>((ref) async {
  return ref.read(communityImpactRepositoryProvider).fetchTransactions();
});

final communityImpactRewardsProvider = FutureProvider<List<CommunityImpactRewardModel>>((ref) async {
  return ref.read(communityImpactRepositoryProvider).fetchRewards();
});

final communityImpactRedemptionsProvider = FutureProvider<List<CommunityImpactRedemptionModel>>((ref) async {
  return ref.read(communityImpactRepositoryProvider).fetchRedemptions();
});

final communityImpactLeaderboardProvider = FutureProvider.family<List<CommunityImpactLeaderboardEntryModel>, String>((ref, period) async {
  return ref.read(communityImpactRepositoryProvider).fetchLeaderboard(period: period);
});

final communityImpactPendingProvider = FutureProvider<List<CommunityImpactTransactionModel>>((ref) async {
  return ref.read(communityImpactRepositoryProvider).fetchPendingApprovals();
});

class CommunityImpactRepository {
  CommunityImpactRepository(this.ref);

  final Ref ref;

  Dio get _dio => ref.read(dioProvider);

  Future<CommunityImpactDashboardModel> fetchDashboard() async {
    final response = await _dio.get('/community-impact/me');
    final data = Map<String, dynamic>.from(response.data as Map);
    return CommunityImpactDashboardModel(
      account: CommunityImpactAccountModel.fromJson(
        (data['account'] as Map<String, dynamic>)['data'] is Map<String, dynamic>
            ? (data['account'] as Map<String, dynamic>)['data'] as Map<String, dynamic>
            : data['account'] as Map<String, dynamic>,
      ),
      recentApproved: ((data['recent_approved'] as Map<String, dynamic>?)?['data'] as List? ?? const [])
          .map((item) => CommunityImpactTransactionModel.fromJson(Map<String, dynamic>.from(item as Map)))
          .toList(),
      pendingTransactions: ((data['pending_transactions'] as Map<String, dynamic>?)?['data'] as List? ?? const [])
          .map((item) => CommunityImpactTransactionModel.fromJson(Map<String, dynamic>.from(item as Map)))
          .toList(),
    );
  }

  Future<List<CommunityImpactTransactionModel>> fetchTransactions() async {
    final response = await _dio.get('/community-impact/my-transactions');
    return ((response.data['data'] as List?) ?? const [])
        .map((item) => CommunityImpactTransactionModel.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<List<CommunityImpactRewardModel>> fetchRewards() async {
    final response = await _dio.get('/community-impact/rewards');
    return ((response.data['data'] as List?) ?? const [])
        .map((item) => CommunityImpactRewardModel.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<void> redeemReward(int rewardId) async {
    await _dio.post('/community-impact/rewards/$rewardId/redeem');
  }

  Future<List<CommunityImpactRedemptionModel>> fetchRedemptions() async {
    final response = await _dio.get('/community-impact/my-redemptions');
    return ((response.data['data'] as List?) ?? const [])
        .map((item) => CommunityImpactRedemptionModel.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<void> updatePrivacy({
    required bool optIn,
    required String privacyMode,
    String? publicDisplayName,
  }) async {
    await _dio.patch('/community-impact/privacy-settings', data: {
      'public_leaderboard_opt_in': optIn,
      'privacy_mode': privacyMode,
      'public_display_name': publicDisplayName,
    });
  }

  Future<List<CommunityImpactLeaderboardEntryModel>> fetchLeaderboard({String period = 'all_time'}) async {
    final response = await _dio.get('/community-impact/leaderboard', queryParameters: {
      'period': period,
    });
    return ((response.data['data'] as List?) ?? const [])
        .map((item) => CommunityImpactLeaderboardEntryModel.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<List<CommunityImpactTransactionModel>> fetchPendingApprovals() async {
    final response = await _dio.get('/admin/community-impact/pending');
    return ((response.data['data'] as List?) ?? const [])
        .map((item) => CommunityImpactTransactionModel.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<void> approvePending(int transactionId, {String? notes}) async {
    await _dio.patch('/admin/community-impact/transactions/$transactionId/approve', data: {
      'internal_notes': notes,
    });
  }

  Future<void> rejectPending(int transactionId, {String? notes}) async {
    await _dio.patch('/admin/community-impact/transactions/$transactionId/reject', data: {
      'internal_notes': notes,
    });
  }
}
