class UserModel {
  UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.location,
    this.defaultTown,
    this.defaultArea,
    this.serviceRadius,
    this.avatar,
    this.bio,
    this.whatsapp,
    this.secondaryPhone,
    this.profession,
    this.businessName,
    this.profileVisibility,
    this.currentRole,
    this.roles = const [],
  });

  final int id;
  final String name;
  final String phone;
  final String? email;
  final String? location;
  final String? defaultTown;
  final String? defaultArea;
  final int? serviceRadius;
  final String? avatar;
  final String? bio;
  final String? whatsapp;
  final String? secondaryPhone;
  final String? profession;
  final String? businessName;
  final String? profileVisibility;
  final String? currentRole;
  final List<String> roles;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      name: json['name'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      location: json['location'] as String?,
      defaultTown: json['default_town'] as String?,
      defaultArea: json['default_area'] as String?,
      serviceRadius: json['service_radius'] as int?,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
      whatsapp: json['whatsapp'] as String?,
      secondaryPhone: json['secondary_phone'] as String?,
      profession: json['profession'] as String?,
      businessName: json['business_name'] as String?,
      profileVisibility: json['profile_visibility'] as String?,
      currentRole: json['current_role'] as String?,
      roles: (json['roles'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
    );
  }
}

class UserPreferenceModel {
  UserPreferenceModel({
    this.defaultTown,
    this.defaultArea,
    this.serviceRadius,
    this.interests = const [],
    this.preferredRoles = const [],
    this.notificationPreferences = const {},
  });

  final String? defaultTown;
  final String? defaultArea;
  final int? serviceRadius;
  final List<String> interests;
  final List<String> preferredRoles;
  final Map<String, dynamic> notificationPreferences;

  factory UserPreferenceModel.fromJson(Map<String, dynamic> json) {
    return UserPreferenceModel(
      defaultTown: json['default_town'] as String?,
      defaultArea: json['default_area'] as String?,
      serviceRadius: json['service_radius'] as int?,
      interests: (json['interests'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      preferredRoles: (json['preferred_roles'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      notificationPreferences:
          Map<String, dynamic>.from(json['notification_preferences'] as Map? ?? const {}),
    );
  }
}

class LocationPointModel {
  const LocationPointModel({
    required this.latitude,
    required this.longitude,
  });

  final double latitude;
  final double longitude;
}

class ReportModel {
  ReportModel({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    required this.status,
    this.location,
    this.town,
    this.area,
    this.priority,
    this.resolutionNotes,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String category;
  final String title;
  final String description;
  final String status;
  final String? location;
  final String? town;
  final String? area;
  final String? priority;
  final String? resolutionNotes;
  final double? latitude;
  final double? longitude;

  factory ReportModel.fromJson(Map<String, dynamic> json) {
    return ReportModel(
      id: json['id'] as int,
      category: (json['category'] ?? 'other').toString(),
      title: (json['title'] ?? 'Report').toString(),
      description: (json['description'] ?? '').toString(),
      status: (json['status'] ?? 'submitted').toString(),
      location: json['location'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      priority: json['priority'] as String?,
      resolutionNotes: json['resolution_notes'] as String?,
      latitude: (json['lat'] as num?)?.toDouble(),
      longitude: (json['lng'] as num?)?.toDouble(),
    );
  }
}

class ServiceModel {
  ServiceModel({
    required this.id,
    required this.name,
    required this.durationMinutes,
    required this.price,
    this.priceType,
    this.isBookable = false,
    this.isActive = true,
    this.description,
  });

  final int id;
  final String name;
  final int durationMinutes;
  final String price;
  final String? priceType;
  final bool isBookable;
  final bool isActive;
  final String? description;

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as int,
      name: json['name'] as String,
      durationMinutes: json['duration_minutes'] as int,
      price: json['price'].toString(),
      priceType: json['price_type'] as String?,
      isBookable: json['is_bookable'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? true,
      description: json['description'] as String?,
    );
  }
}

class AvailabilitySlotModel {
  AvailabilitySlotModel({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
  });

  final int id;
  final int dayOfWeek;
  final String startTime;
  final String endTime;

  factory AvailabilitySlotModel.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlotModel(
      id: json['id'] as int,
      dayOfWeek: json['day_of_week'] as int,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
    );
  }
}

class ProviderModel {
  ProviderModel({
    required this.id,
    required this.name,
    required this.category,
    required this.location,
    required this.isVerified,
    this.userId,
    this.description,
    this.phone,
    this.avatarUrl,
    this.whatsapp,
    this.email,
    this.status = 'active',
    this.distanceKm,
    this.subcategory,
    this.about,
    this.town,
    this.area,
    this.openNow = false,
    this.availabilityStatus,
    this.responseTimeLabel,
    this.followersCount,
    this.reviewCount,
    this.rating,
    this.alerts = const [],
    this.openingHours = const [],
    this.services = const [],
    this.availabilitySlots = const [],
  });

  final int id;
  final String name;
  final String category;
  final String location;
  final bool isVerified;
  final int? userId;
  final String status;
  final String? description;
  final String? phone;
  final String? avatarUrl;
  final String? whatsapp;
  final String? email;
  final double? distanceKm;
  final String? subcategory;
  final String? about;
  final String? town;
  final String? area;
  final bool openNow;
  final String? availabilityStatus;
  final String? responseTimeLabel;
  final int? followersCount;
  final int? reviewCount;
  final double? rating;
  final List<AlertFeedModel> alerts;
  final List<Map<String, dynamic>> openingHours;
  final List<ServiceModel> services;
  final List<AvailabilitySlotModel> availabilitySlots;

  factory ProviderModel.fromJson(Map<String, dynamic> json) {
      return ProviderModel(
        id: json['id'] as int,
        name: json['name'] as String,
        category: json['category'] as String,
        location: json['location'] as String,
        isVerified: json['is_verified'] as bool? ?? false,
        userId: json['user_id'] as int?,
        status: json['status']?.toString() ?? 'active',
      description: json['description'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      whatsapp: json['whatsapp'] as String?,
      email: json['email'] as String?,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
      subcategory: json['subcategory'] as String?,
      about: json['about'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      openNow: json['open_now'] as bool? ?? false,
      availabilityStatus: json['availability_status'] as String?,
      responseTimeLabel: json['response_time_label'] as String?,
      followersCount: json['followers_count'] as int?,
      reviewCount: json['review_count'] as int?,
      rating: (json['rating'] as num?)?.toDouble(),
      alerts: (json['alerts'] as List<dynamic>? ?? const [])
          .map((item) => AlertFeedModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      openingHours: (json['opening_hours'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList(),
      services: (json['services'] as List<dynamic>? ?? const [])
          .map((item) => ServiceModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      availabilitySlots:
          (json['availability_slots'] as List<dynamic>? ?? const [])
              .map(
                (item) => AvailabilitySlotModel.fromJson(
                  item as Map<String, dynamic>,
                ),
              )
              .toList(),
    );
  }
}

class BookingModel {
  BookingModel({
    required this.id,
    required this.bookingDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.serviceName,
    this.providerName,
    this.customerName,
    this.notes,
  });

  final int id;
  final String bookingDate;
  final String startTime;
  final String endTime;
  final String status;
  final String? serviceName;
  final String? providerName;
  final String? customerName;
  final String? notes;

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as int,
      bookingDate: json['booking_date'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      status: json['status'] as String,
      notes: json['notes'] as String?,
      serviceName:
          (json['service'] as Map<String, dynamic>?)?['name'] as String?,
      providerName:
          (json['service_provider'] as Map<String, dynamic>?)?['name']
              as String?,
      customerName:
          (json['user'] as Map<String, dynamic>?)?['name'] as String?,
    );
  }
}

class ListingModel {
  ListingModel({
    required this.id,
    required this.title,
    required this.type,
    required this.description,
    required this.status,
    this.price,
    this.location,
    this.imageUrl,
    this.userName,
    this.userAvatar,
    this.businessName,
  });

  final int id;
  final String title;
  final String type;
  final String description;
  final String status;
  final String? price;
  final String? location;
  final String? imageUrl;
  final String? userName;
  final String? userAvatar;
  final String? businessName;

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    return ListingModel(
      id: json['id'] as int,
      title: json['title'] as String,
      type: json['type'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      price: json['price']?.toString(),
      location: json['location'] as String?,
      imageUrl: json['image_url'] as String?,
      userName: (json['user'] as Map<String, dynamic>?)?['name'] as String?,
      userAvatar: (json['user'] as Map<String, dynamic>?)?['avatar'] as String?,
      businessName: (json['user'] as Map<String, dynamic>?)?['business_name'] as String?,
    );
  }
}

class JobModel {
  JobModel({
    required this.id,
    required this.title,
    required this.description,
    required this.employmentType,
    required this.status,
    this.posterUserId,
    this.compensation,
    this.location,
    this.skills = const [],
    this.organizationId,
    this.organizationName,
    this.posterName,
    this.posterPhone,
    this.applicationsCount = 0,
    this.distanceKm,
  });

  final int id;
  final String title;
  final String description;
  final String employmentType;
  final String status;
  final int? posterUserId;
  final String? compensation;
  final String? location;
  final List<String> skills;
  final int? organizationId;
  final String? organizationName;
  final String? posterName;
  final String? posterPhone;
  final int applicationsCount;
  final double? distanceKm;

  factory JobModel.fromJson(Map<String, dynamic> json) {
    final organization = json['organization'] as Map<String, dynamic>?;
    final user = json['user'] as Map<String, dynamic>?;
      return JobModel(
        id: json['id'] as int,
        title: json['title'] as String,
        description: (json['description'] as String?) ?? 'Local job opportunity posted nearby.',
        employmentType: json['employment_type'] as String,
        status: json['status']?.toString() ?? 'open',
        posterUserId: user?['id'] as int?,
        compensation: json['compensation']?.toString(),
      location: json['location'] as String?,
      skills: (json['skills'] as List<dynamic>? ?? const []).map((item) => item.toString()).toList(),
      organizationId: organization?['id'] as int?,
      organizationName: organization?['name'] as String?,
      posterName: user?['name'] as String?,
      posterPhone: user?['phone'] as String?,
      applicationsCount: json['applications_count'] as int? ?? 0,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }
}

class WorkerModel {
  WorkerModel({
    required this.id,
    required this.headline,
    required this.isAvailable,
    this.name,
    this.location,
    this.rate,
    this.skills = const [],
    this.experienceYears,
    this.phone,
    this.whatsapp,
    this.avatar,
    this.distanceKm,
  });

  final int id;
  final String headline;
  final bool isAvailable;
  final String? name;
  final String? location;
  final String? rate;
  final List<String> skills;
  final int? experienceYears;
  final String? phone;
  final String? whatsapp;
  final String? avatar;
  final double? distanceKm;

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return WorkerModel(
      id: json['id'] as int,
      headline: json['headline'] as String,
      isAvailable: json['is_available'] as bool? ?? true,
      name: user?['name'] as String?,
      location: json['location'] as String?,
      rate: json['hourly_rate']?.toString() ?? json['rate']?.toString(),
      skills: (json['skills'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      experienceYears: json['experience_years'] as int?,
      phone: user?['phone'] as String?,
      whatsapp: user?['whatsapp'] as String?,
      avatar: user?['avatar'] as String?,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }
}

class OrganizationModel {
  OrganizationModel({
    required this.id,
    required this.name,
    required this.category,
    this.subcategory,
    this.description,
    this.location,
    this.town,
    this.area,
    this.phone,
    this.logoUrl,
    this.whatsapp,
    this.distanceKm,
    this.isVerified = false,
    this.status = 'active',
    this.openNow = false,
    this.availabilityStatus,
    this.emergencyContact = false,
    this.isPublicService = false,
    this.openingHours = const [],
    this.servicesOffered = const [],
    this.followersCount,
    this.reviewCount,
    this.rating,
    this.alerts = const [],
  });

  final int id;
  final String name;
  final String category;
  final String? subcategory;
  final String? description;
  final String? location;
  final String? town;
  final String? area;
  final String? phone;
  final String? logoUrl;
  final String? whatsapp;
  final double? distanceKm;
  final bool isVerified;
  final String status;
  final bool openNow;
  final String? availabilityStatus;
  final bool emergencyContact;
  final bool isPublicService;
  final List<Map<String, dynamic>> openingHours;
  final List<String> servicesOffered;
  final int? followersCount;
  final int? reviewCount;
  final double? rating;
  final List<AlertFeedModel> alerts;

  factory OrganizationModel.fromJson(Map<String, dynamic> json) {
    return OrganizationModel(
      id: json['id'] as int,
      name: json['name'] as String,
      category: json['category'] as String,
      subcategory: json['subcategory'] as String?,
      description: json['description'] as String?,
      location: json['location'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      phone: json['phone'] as String?,
      logoUrl: json['logo_url'] as String?,
      whatsapp: json['whatsapp'] as String?,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
      isVerified: json['is_verified'] as bool? ?? false,
      status: json['status']?.toString() ?? 'active',
      openNow: json['open_now'] as bool? ?? false,
      availabilityStatus: json['availability_status'] as String?,
      emergencyContact: json['emergency_contact'] as bool? ?? false,
      isPublicService: json['is_public_service'] as bool? ?? false,
      openingHours: (json['opening_hours'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList(),
      servicesOffered: (json['services_offered'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      followersCount: json['followers_count'] as int?,
      reviewCount: json['review_count'] as int?,
      rating: (json['rating'] as num?)?.toDouble(),
      alerts: (json['alerts'] as List<dynamic>? ?? const [])
          .map((item) => AlertFeedModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class DeliveryModel {
  DeliveryModel({
    required this.id,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.itemDescription,
    this.price,
    this.parcelSize,
    this.weightKg,
    this.urgency,
    this.notes,
    this.photoUrl,
    this.pickupLatitude,
    this.pickupLongitude,
    this.dropoffLatitude,
    this.dropoffLongitude,
    this.status,
    this.trackingStatus,
    this.statusLabel,
    this.referenceCode,
    this.estimatedDistanceKm,
    this.estimatedDurationMinutes,
    this.mapUrl,
    this.createdAt,
    this.updatedAt,
    this.userName,
    this.userPhone,
    this.driverName,
    this.driverPhone,
    this.driverVehicleType,
    this.driverVehicleRegistration,
    this.driverRating,
    this.proofOfDeliveryLabel,
  });

  final int id;
  final String pickupAddress;
  final String dropoffAddress;
  final String itemDescription;
  final String? price;
  final String? parcelSize;
  final String? weightKg;
  final String? urgency;
  final String? notes;
  final String? photoUrl;
  final double? pickupLatitude;
  final double? pickupLongitude;
  final double? dropoffLatitude;
  final double? dropoffLongitude;
  final String? status;
  final String? trackingStatus;
  final String? statusLabel;
  final String? referenceCode;
  final double? estimatedDistanceKm;
  final int? estimatedDurationMinutes;
  final String? mapUrl;
  final String? createdAt;
  final String? updatedAt;
  final String? userName;
  final String? userPhone;
  final String? driverName;
  final String? driverPhone;
  final String? driverVehicleType;
  final String? driverVehicleRegistration;
  final double? driverRating;
  final String? proofOfDeliveryLabel;

  factory DeliveryModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final driver = json['driver'] as Map<String, dynamic>?;
    final courierProfile = json['courier_profile'] as Map<String, dynamic>?;
    final proofOfDelivery = json['proof_of_delivery'] as Map<String, dynamic>?;
    return DeliveryModel(
      id: json['id'] as int,
      pickupAddress: (json['pickup_address'] ?? json['pickup_location'] ?? '') as String,
      dropoffAddress: (json['dropoff_address'] ?? json['dropoff_location'] ?? '') as String,
      itemDescription: (json['item_description'] ?? json['parcel_description'] ?? '') as String,
      price: json['estimated_price']?.toString() ?? json['price']?.toString(),
      parcelSize: json['parcel_size'] as String?,
      weightKg: json['weight_kg']?.toString(),
      urgency: json['urgency']?.toString(),
      notes: json['notes'] as String?,
      photoUrl: json['photo_url'] as String?,
      pickupLatitude: (json['pickup_latitude'] as num?)?.toDouble(),
      pickupLongitude: (json['pickup_longitude'] as num?)?.toDouble(),
      dropoffLatitude: (json['dropoff_latitude'] as num?)?.toDouble(),
      dropoffLongitude: (json['dropoff_longitude'] as num?)?.toDouble(),
      status: json['status']?.toString(),
      trackingStatus: json['tracking_status']?.toString(),
      statusLabel: json['status_label']?.toString(),
      referenceCode: json['reference_code']?.toString(),
      estimatedDistanceKm: (json['estimated_distance_km'] as num?)?.toDouble(),
      estimatedDurationMinutes: (json['estimated_duration_minutes'] as num?)?.toInt(),
      mapUrl: json['map_url']?.toString(),
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      userName: user?['name'] as String?,
      userPhone: user?['phone'] as String?,
      driverName: driver?['name'] as String?,
      driverPhone: driver?['phone'] as String?,
      driverVehicleType: courierProfile?['vehicle_type']?.toString(),
      driverVehicleRegistration: courierProfile?['vehicle_registration']?.toString(),
      driverRating: (courierProfile?['rating'] as num?)?.toDouble(),
      proofOfDeliveryLabel: proofOfDelivery?['label']?.toString(),
    );
  }
}

class AlertFeedModel {
  AlertFeedModel({
    required this.id,
    required this.sourceType,
    required this.title,
    required this.body,
    this.location,
    this.severity,
    this.timestamp,
  });

  final String id;
  final String sourceType;
  final String title;
  final String body;
  final String? location;
  final String? severity;
  final String? timestamp;

  factory AlertFeedModel.fromJson(Map<String, dynamic> json) {
    return AlertFeedModel(
      id: json['id'].toString(),
      sourceType: json['source_type']?.toString() ?? 'alert',
      title: json['title'] as String,
      body: json['body'] as String,
      location: json['location'] as String?,
      severity: json['severity'] as String?,
      timestamp: json['timestamp'] as String?,
    );
  }
}

class NewsItemModel {
  NewsItemModel({
    required this.id,
    required this.title,
    required this.summary,
    required this.sourceName,
    required this.sourceUrl,
    required this.externalUrl,
    required this.category,
    required this.sourceType,
    this.imageUrl,
    this.town,
    this.area,
    this.region,
    this.tags = const [],
    this.isFeatured = false,
    this.publishedAt,
    this.feedReason,
    this.sourceDomain,
    this.complianceNotice,
    this.sourceEntity,
  });

  final int id;
  final String title;
  final String summary;
  final String sourceName;
  final String sourceUrl;
  final String externalUrl;
  final String? imageUrl;
  final String category;
  final String sourceType;
  final String? town;
  final String? area;
  final String? region;
  final List<String> tags;
  final bool isFeatured;
  final String? publishedAt;
  final String? feedReason;
  final String? sourceDomain;
  final String? complianceNotice;
  final NewsSourceEntityModel? sourceEntity;

  factory NewsItemModel.fromJson(Map<String, dynamic> json) {
    return NewsItemModel(
      id: json['id'] as int,
      title: json['title'] as String,
      summary: json['summary'] as String,
      sourceName: json['source_name'] as String,
      sourceUrl: json['source_url'] as String,
      externalUrl: json['external_url'] as String,
      imageUrl: json['image_url'] as String?,
      category: json['category']?.toString() ?? 'community',
      sourceType: json['source_type']?.toString() ?? 'website',
      town: json['town'] as String?,
      area: json['area'] as String?,
      region: json['region'] as String?,
      tags: (json['tags'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      isFeatured: json['is_featured'] as bool? ?? false,
      publishedAt: json['published_at'] as String?,
      feedReason: json['feed_reason'] as String?,
      sourceDomain: json['source_domain'] as String?,
      complianceNotice: json['compliance_notice'] as String?,
      sourceEntity: (json['source_entity'] as Map<String, dynamic>?) == null
          ? null
          : NewsSourceEntityModel.fromJson(json['source_entity'] as Map<String, dynamic>),
    );
  }
}

class NewsSourceEntityModel {
  NewsSourceEntityModel({
    required this.type,
    required this.id,
    required this.name,
    this.isVerified = false,
  });

  final String type;
  final int id;
  final String name;
  final bool isVerified;

  factory NewsSourceEntityModel.fromJson(Map<String, dynamic> json) {
    return NewsSourceEntityModel(
      type: json['type'] as String? ?? 'organization',
      id: json['id'] as int,
      name: json['name'] as String? ?? 'Source',
      isVerified: json['is_verified'] as bool? ?? false,
    );
  }
}

class EventModel {
  EventModel({
    required this.id,
    required this.title,
    required this.category,
    this.description,
    this.venueName,
    this.location,
    this.locationLabel,
    this.town,
    this.area,
    this.startsAt,
    this.endsAt,
    this.imageUrl,
    this.status,
    this.isFree = true,
    this.ticketingEnabled = false,
    this.capacity,
    this.isFeatured = false,
    this.attendeesCount = 0,
    this.savesCount = 0,
    this.isSaved = false,
    this.ticketPriceFrom,
    this.ticketPriceTo,
    this.organizer,
    this.ticketTypes = const [],
    this.calendar,
  });

  final int id;
  final String title;
  final String category;
  final String? description;
  final String? venueName;
  final String? location;
  final String? locationLabel;
  final String? town;
  final String? area;
  final String? startsAt;
  final String? endsAt;
  final String? imageUrl;
  final String? status;
  final bool isFree;
  final bool ticketingEnabled;
  final int? capacity;
  final bool isFeatured;
  final int attendeesCount;
  final int savesCount;
  final bool isSaved;
  final String? ticketPriceFrom;
  final String? ticketPriceTo;
  final EventOrganizerModel? organizer;
  final List<EventTicketTypeModel> ticketTypes;
  final EventCalendarModel? calendar;

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'] as int,
      title: json['title'] as String,
      category: json['category']?.toString() ?? 'community',
      description: json['description'] as String?,
      venueName: json['venue_name'] as String?,
      location: json['location'] as String?,
      locationLabel: json['location_label'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      startsAt: json['starts_at'] as String?,
      endsAt: json['ends_at'] as String?,
      imageUrl: json['image_url'] as String?,
      status: json['status']?.toString(),
      isFree: json['is_free'] as bool? ?? true,
      ticketingEnabled: json['ticketing_enabled'] as bool? ?? false,
      capacity: json['capacity'] as int?,
      isFeatured: json['is_featured'] as bool? ?? false,
      attendeesCount: json['attendees_count'] as int? ?? 0,
      savesCount: json['saves_count'] as int? ?? 0,
      isSaved: json['is_saved'] as bool? ?? false,
      ticketPriceFrom: json['ticket_price_from']?.toString(),
      ticketPriceTo: json['ticket_price_to']?.toString(),
      organizer: (json['organizer'] as Map<String, dynamic>?) == null
          ? null
          : EventOrganizerModel.fromJson(json['organizer'] as Map<String, dynamic>),
      ticketTypes: (json['ticket_types'] as List<dynamic>? ?? const [])
          .map((item) => EventTicketTypeModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      calendar: (json['calendar'] as Map<String, dynamic>?) == null
          ? null
          : EventCalendarModel.fromJson(json['calendar'] as Map<String, dynamic>),
    );
  }
}

class EventOrganizerModel {
  EventOrganizerModel({
    required this.id,
    required this.name,
    this.type,
    this.phone,
    this.whatsapp,
    this.isVerified = false,
  });

  final int id;
  final String name;
  final String? type;
  final String? phone;
  final String? whatsapp;
  final bool isVerified;

  factory EventOrganizerModel.fromJson(Map<String, dynamic> json) {
    return EventOrganizerModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? 'Organizer',
      type: json['type'] as String?,
      phone: json['phone'] as String?,
      whatsapp: json['whatsapp'] as String?,
      isVerified: json['is_verified'] as bool? ?? false,
    );
  }
}

class EventCalendarModel {
  EventCalendarModel({
    required this.icsUrl,
    required this.title,
    this.startsAt,
    this.endsAt,
    this.location,
  });

  final String icsUrl;
  final String title;
  final String? startsAt;
  final String? endsAt;
  final String? location;

  factory EventCalendarModel.fromJson(Map<String, dynamic> json) {
    return EventCalendarModel(
      icsUrl: json['ics_url'] as String,
      title: json['title'] as String? ?? 'Event',
      startsAt: json['starts_at'] as String?,
      endsAt: json['ends_at'] as String?,
      location: json['location'] as String?,
    );
  }
}

class EventTicketTypeModel {
  EventTicketTypeModel({
    required this.id,
    required this.name,
    this.description,
    this.price,
    this.quantityAvailable,
    this.quantitySold = 0,
    this.salesStartAt,
    this.salesEndAt,
    this.isActive = true,
  });

  final int id;
  final String name;
  final String? description;
  final String? price;
  final int? quantityAvailable;
  final int quantitySold;
  final String? salesStartAt;
  final String? salesEndAt;
  final bool isActive;

  factory EventTicketTypeModel.fromJson(Map<String, dynamic> json) {
    return EventTicketTypeModel(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: json['price']?.toString(),
      quantityAvailable: json['quantity_available'] as int?,
      quantitySold: json['quantity_sold'] as int? ?? 0,
      salesStartAt: json['sales_start_at'] as String?,
      salesEndAt: json['sales_end_at'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}

class EventTicketModel {
  EventTicketModel({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.ticketCode,
    required this.status,
    this.ticketTypeId,
    this.pricePaid,
    this.holderName,
    this.holderPhone,
    this.qrCodePayload,
    this.reservedAt,
    this.confirmedAt,
    this.usedAt,
    this.event,
    this.ticketType,
  });

  final int id;
  final int eventId;
  final int userId;
  final int? ticketTypeId;
  final String ticketCode;
  final String status;
  final String? pricePaid;
  final String? holderName;
  final String? holderPhone;
  final String? qrCodePayload;
  final String? reservedAt;
  final String? confirmedAt;
  final String? usedAt;
  final EventModel? event;
  final EventTicketTypeModel? ticketType;

  factory EventTicketModel.fromJson(Map<String, dynamic> json) {
    return EventTicketModel(
      id: json['id'] as int,
      eventId: json['event_id'] as int,
      userId: json['user_id'] as int,
      ticketTypeId: json['ticket_type_id'] as int?,
      ticketCode: json['ticket_code'] as String,
      status: json['status'] as String? ?? 'reserved',
      pricePaid: json['price_paid']?.toString(),
      holderName: json['holder_name'] as String?,
      holderPhone: json['holder_phone'] as String?,
      qrCodePayload: json['qr_code_payload'] as String?,
      reservedAt: json['reserved_at'] as String?,
      confirmedAt: json['confirmed_at'] as String?,
      usedAt: json['used_at'] as String?,
      event: (json['event'] as Map<String, dynamic>?) == null
          ? null
          : EventModel.fromJson(json['event'] as Map<String, dynamic>),
      ticketType: (json['ticket_type'] as Map<String, dynamic>?) == null
          ? null
          : EventTicketTypeModel.fromJson(json['ticket_type'] as Map<String, dynamic>),
    );
  }
}

class RideModel {
  RideModel({
    required this.id,
    required this.pickupLocation,
    required this.dropoffLocation,
    this.fareEstimate,
    this.rideType,
    this.tripPurpose,
    this.notes,
    this.pickupAddress,
    this.dropoffAddress,
    this.pickupLatitude,
    this.pickupLongitude,
    this.dropoffLatitude,
    this.dropoffLongitude,
    this.status,
    this.trackingStatus,
    this.statusLabel,
    this.referenceCode,
    this.estimatedDistanceKm,
    this.estimatedEtaMinutes,
    this.estimatedDurationMinutes,
    this.mapUrl,
    this.vehicleLabel,
    this.createdAt,
    this.updatedAt,
    this.userName,
    this.userPhone,
    this.driverName,
    this.driverPhone,
    this.driverVehicleType,
    this.driverVehicleRegistration,
    this.driverRating,
  });

  final int id;
  final String pickupLocation;
  final String dropoffLocation;
  final String? fareEstimate;
  final String? rideType;
  final String? tripPurpose;
  final String? notes;
  final String? pickupAddress;
  final String? dropoffAddress;
  final double? pickupLatitude;
  final double? pickupLongitude;
  final double? dropoffLatitude;
  final double? dropoffLongitude;
  final String? status;
  final String? trackingStatus;
  final String? statusLabel;
  final String? referenceCode;
  final double? estimatedDistanceKm;
  final int? estimatedEtaMinutes;
  final int? estimatedDurationMinutes;
  final String? mapUrl;
  final String? vehicleLabel;
  final String? createdAt;
  final String? updatedAt;
  final String? userName;
  final String? userPhone;
  final String? driverName;
  final String? driverPhone;
  final String? driverVehicleType;
  final String? driverVehicleRegistration;
  final double? driverRating;

  factory RideModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final driver = json['driver'] as Map<String, dynamic>?;
    final driverProfile = json['driver_profile'] as Map<String, dynamic>?;
    return RideModel(
      id: json['id'] as int,
      pickupLocation: json['pickup_location'] as String,
      dropoffLocation: json['dropoff_location'] as String,
      fareEstimate: json['fare_estimate']?.toString(),
      rideType: json['ride_type'] as String?,
      tripPurpose: json['trip_purpose'] as String?,
      notes: json['notes'] as String?,
      pickupAddress: json['pickup_address'] as String?,
      dropoffAddress: json['dropoff_address'] as String?,
      pickupLatitude: (json['pickup_latitude'] as num?)?.toDouble(),
      pickupLongitude: (json['pickup_longitude'] as num?)?.toDouble(),
      dropoffLatitude: (json['dropoff_latitude'] as num?)?.toDouble(),
      dropoffLongitude: (json['dropoff_longitude'] as num?)?.toDouble(),
      status: json['status']?.toString(),
      trackingStatus: json['tracking_status']?.toString(),
      statusLabel: json['status_label']?.toString(),
      referenceCode: json['reference_code']?.toString(),
      estimatedDistanceKm: (json['estimated_distance_km'] as num?)?.toDouble(),
      estimatedEtaMinutes: json['estimated_eta_minutes'] as int?,
      estimatedDurationMinutes: (json['estimated_duration_minutes'] as num?)?.toInt(),
      mapUrl: json['map_url']?.toString(),
      vehicleLabel: json['vehicle_label']?.toString(),
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      userName: user?['name'] as String?,
      userPhone: user?['phone'] as String?,
      driverName: driver?['name'] as String?,
      driverPhone: driver?['phone'] as String?,
      driverVehicleType: driverProfile?['vehicle_type']?.toString(),
      driverVehicleRegistration: driverProfile?['vehicle_registration']?.toString(),
      driverRating: (driverProfile?['rating'] as num?)?.toDouble(),
    );
  }
}

class ProductModel {
  ProductModel({
    required this.id,
    required this.title,
    required this.price,
    this.description,
    this.salePrice,
    this.imageUrl,
    this.category,
    this.town,
    this.area,
    this.stockStatus,
    this.businessId,
    this.businessName,
    this.businessPhone,
    this.businessWhatsapp,
    this.businessLogoUrl,
    this.businessVerified = false,
    this.userId,
    this.userName,
    this.userPhone,
    this.userWhatsapp,
    this.userAvatar,
    this.userBusinessName,
    this.openNow = false,
    this.availabilityStatus,
    this.availabilityCode,
    this.deliveryFee,
    this.deliveryEtaMinutes,
    this.fastDelivery = false,
    this.rating,
    this.reviewCount,
    this.commerceCategory,
    this.heroImageUrl,
    this.isFeatured = false,
    this.isPopular = false,
  });

  final int id;
  final String title;
  final String price;
  final String? description;
  final String? salePrice;
  final String? imageUrl;
  final String? category;
  final String? town;
  final String? area;
  final String? stockStatus;
  final int? businessId;
  final String? businessName;
  final String? businessPhone;
  final String? businessWhatsapp;
  final String? businessLogoUrl;
  final bool businessVerified;
  final int? userId;
  final String? userName;
  final String? userPhone;
  final String? userWhatsapp;
  final String? userAvatar;
  final String? userBusinessName;
  final bool openNow;
  final String? availabilityStatus;
  final String? availabilityCode;
  final String? deliveryFee;
  final int? deliveryEtaMinutes;
  final bool fastDelivery;
  final double? rating;
  final int? reviewCount;
  final String? commerceCategory;
  final String? heroImageUrl;
  final bool isFeatured;
  final bool isPopular;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final business = json['business'] as Map<String, dynamic>?;
    final user = json['user'] as Map<String, dynamic>?;
    return ProductModel(
      id: json['id'] as int,
      title: json['title'] as String,
      price: json['price'].toString(),
      description: json['description'] as String?,
      salePrice: json['sale_price']?.toString(),
      imageUrl: json['image_url'] as String?,
      category: json['category'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      stockStatus: json['stock_status'] as String?,
      businessId: business?['id'] as int?,
      businessName: business?['name'] as String?,
      businessPhone: business?['phone'] as String?,
      businessWhatsapp: business?['whatsapp'] as String?,
      businessLogoUrl: business?['logo_url'] as String?,
      businessVerified: business?['is_verified'] as bool? ?? false,
      userId: user?['id'] as int?,
      userName: user?['name'] as String?,
      userPhone: user?['phone'] as String?,
      userWhatsapp: user?['whatsapp'] as String?,
      userAvatar: user?['avatar'] as String?,
      userBusinessName: user?['business_name'] as String?,
      openNow: (json['open_now'] as bool?) ?? (business?['open_now'] as bool?) ?? false,
      availabilityStatus: (json['availability_status'] ?? business?['availability_status']) as String?,
      availabilityCode: (json['availability_code'] ?? business?['availability_code']) as String?,
      deliveryFee: (json['delivery_fee'] ?? business?['delivery_fee'])?.toString(),
      deliveryEtaMinutes: (json['delivery_eta_minutes'] ?? business?['delivery_eta_minutes']) as int?,
      fastDelivery: (json['fast_delivery'] as bool?) ?? (business?['fast_delivery'] as bool?) ?? false,
      rating: ((json['rating'] ?? business?['rating']) as num?)?.toDouble(),
      reviewCount: (json['review_count'] ?? business?['review_count']) as int?,
      commerceCategory: (json['commerce_category'] ?? business?['commerce_category']) as String?,
      heroImageUrl: (json['hero_image_url'] ?? business?['logo_url'] ?? json['image_url']) as String?,
      isFeatured: json['is_featured'] as bool? ?? false,
      isPopular: json['is_popular'] as bool? ?? false,
    );
  }
}

class CommerceOrderItemModel {
  CommerceOrderItemModel({
    required this.id,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.productId,
    this.notes,
  });

  final int id;
  final String name;
  final int quantity;
  final String unitPrice;
  final String totalPrice;
  final int? productId;
  final String? notes;

  factory CommerceOrderItemModel.fromJson(Map<String, dynamic> json) {
    return CommerceOrderItemModel(
      id: json['id'] as int? ?? 0,
      name: (json['name'] ?? 'Item').toString(),
      quantity: json['quantity'] as int? ?? 1,
      unitPrice: (json['unit_price'] ?? 0).toString(),
      totalPrice: (json['total_price'] ?? 0).toString(),
      productId: json['product_id'] as int?,
      notes: json['notes'] as String?,
    );
  }
}

class CommerceOrderTrackingStepModel {
  CommerceOrderTrackingStepModel({
    required this.key,
    required this.label,
    this.timestamp,
    this.isComplete = false,
    this.isCurrent = false,
  });

  final String key;
  final String label;
  final String? timestamp;
  final bool isComplete;
  final bool isCurrent;

  factory CommerceOrderTrackingStepModel.fromJson(Map<String, dynamic> json) {
    return CommerceOrderTrackingStepModel(
      key: (json['key'] ?? 'status').toString(),
      label: (json['label'] ?? 'Status').toString(),
      timestamp: json['timestamp'] as String?,
      isComplete: json['is_complete'] as bool? ?? false,
      isCurrent: json['is_current'] as bool? ?? false,
    );
  }
}

class CommerceOrderModel {
  CommerceOrderModel({
    required this.id,
    required this.status,
    required this.items,
    this.referenceCode,
    this.statusLabel,
    this.paymentStatus,
    this.customerName,
    this.sellerName,
    this.courierName,
    this.deliveryAddress,
    this.pickupAddress,
    this.subtotal,
    this.deliveryFee,
    this.serviceFee,
    this.total,
    this.estimatedArrivalMinutes,
    this.createdAt,
    this.updatedAt,
    this.nextActionLabel,
    this.trackingSteps = const [],
  });

  final int id;
  final String status;
  final List<CommerceOrderItemModel> items;
  final String? referenceCode;
  final String? statusLabel;
  final String? paymentStatus;
  final String? customerName;
  final String? sellerName;
  final String? courierName;
  final String? deliveryAddress;
  final String? pickupAddress;
  final String? subtotal;
  final String? deliveryFee;
  final String? serviceFee;
  final String? total;
  final int? estimatedArrivalMinutes;
  final String? createdAt;
  final String? updatedAt;
  final String? nextActionLabel;
  final List<CommerceOrderTrackingStepModel> trackingSteps;

  factory CommerceOrderModel.fromJson(Map<String, dynamic> json) {
    final totals = (json['totals'] as Map?)?.cast<String, dynamic>() ?? const <String, dynamic>{};
    final customer = (json['customer'] as Map?)?.cast<String, dynamic>();
    final seller =
        ((json['seller'] ?? json['business']) as Map?)?.cast<String, dynamic>();
    final courier = (json['courier'] as Map?)?.cast<String, dynamic>();
    final deliveryLocation =
        (json['delivery_location'] as Map?)?.cast<String, dynamic>();
    final pickupLocation =
        (json['pickup_location'] as Map?)?.cast<String, dynamic>();

    return CommerceOrderModel(
      id: json['id'] as int,
      status: (json['status'] ?? 'pending').toString(),
      referenceCode: json['reference_code'] as String?,
      statusLabel: json['status_label'] as String?,
      paymentStatus: json['payment_status'] as String?,
      customerName: customer?['name'] as String?,
      sellerName: seller?['name'] as String?,
      courierName: courier?['name'] as String?,
      deliveryAddress: deliveryLocation?['address'] as String? ?? json['delivery_address'] as String?,
      pickupAddress: pickupLocation?['address'] as String? ?? json['pickup_address'] as String?,
      subtotal: (totals['subtotal'] ?? json['subtotal'])?.toString(),
      deliveryFee: (totals['delivery_fee'] ?? json['delivery_fee'])?.toString(),
      serviceFee: (totals['service_fee'] ?? json['service_fee'])?.toString(),
      total: (totals['total'] ?? json['total'])?.toString(),
      estimatedArrivalMinutes: json['estimated_arrival_minutes'] as int?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      nextActionLabel: json['next_action_label'] as String?,
      items: (json['items'] as List<dynamic>? ?? const [])
          .map((item) => CommerceOrderItemModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      trackingSteps: (json['tracking_steps'] as List<dynamic>? ?? const [])
          .map((item) => CommerceOrderTrackingStepModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class HirePartyModel {
  HirePartyModel({
    required this.id,
    required this.name,
    this.phone,
    this.avatar,
    this.defaultTown,
    this.defaultArea,
  });

  final int id;
  final String name;
  final String? phone;
  final String? avatar;
  final String? defaultTown;
  final String? defaultArea;

  factory HirePartyModel.fromJson(Map<String, dynamic> json) {
    return HirePartyModel(
      id: json['id'] as int? ?? 0,
      name: (json['name'] ?? 'Local owner').toString(),
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      defaultTown: json['default_town'] as String?,
      defaultArea: json['default_area'] as String?,
    );
  }
}

class HireBusinessModel {
  HireBusinessModel({
    required this.id,
    required this.name,
    this.category,
    this.phone,
    this.whatsapp,
    this.logoUrl,
    this.town,
    this.area,
    this.location,
    this.isVerified = false,
  });

  final int id;
  final String name;
  final String? category;
  final String? phone;
  final String? whatsapp;
  final String? logoUrl;
  final String? town;
  final String? area;
  final String? location;
  final bool isVerified;

  factory HireBusinessModel.fromJson(Map<String, dynamic> json) {
    return HireBusinessModel(
      id: json['id'] as int? ?? 0,
      name: (json['name'] ?? 'Local business').toString(),
      category: json['category'] as String?,
      phone: json['phone'] as String?,
      whatsapp: json['whatsapp'] as String?,
      logoUrl: json['logo_url'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      location: json['location'] as String?,
      isVerified: json['is_verified'] as bool? ?? false,
    );
  }
}

class HirePricingModel {
  HirePricingModel({
    this.pricePerHour,
    this.pricePerDay,
  });

  final String? pricePerHour;
  final String? pricePerDay;

  factory HirePricingModel.fromJson(Map<String, dynamic> json) {
    return HirePricingModel(
      pricePerHour: json['price_per_hour']?.toString(),
      pricePerDay: json['price_per_day']?.toString(),
    );
  }
}

class HireAvailabilitySummaryModel {
  HireAvailabilitySummaryModel({
    this.available = true,
    this.requestedWindowAvailable = true,
    this.nextAvailableAt,
    this.status,
    this.verificationStatus,
  });

  final bool available;
  final bool requestedWindowAvailable;
  final String? nextAvailableAt;
  final String? status;
  final String? verificationStatus;

  factory HireAvailabilitySummaryModel.fromJson(Map<String, dynamic> json) {
    return HireAvailabilitySummaryModel(
      available: json['available'] as bool? ?? true,
      requestedWindowAvailable:
          json['requested_window_available'] as bool? ?? true,
      nextAvailableAt: json['next_available_at'] as String?,
      status: json['status'] as String?,
      verificationStatus: json['verification_status'] as String?,
    );
  }
}

class HireItemModel {
  HireItemModel({
    required this.id,
    required this.title,
    required this.category,
    this.description,
    this.owner,
    this.business,
    this.town,
    this.area,
    this.address,
    this.latitude,
    this.longitude,
    this.prices,
    this.deposit,
    this.replacementValue,
    this.deliveryAvailable = false,
    this.pickupAvailable = true,
    this.condition,
    this.status,
    this.verificationStatus,
    this.images = const [],
    this.rules = const [],
    this.includedItems = const [],
    this.rating,
    this.bookingsCount,
    this.availabilitySummary,
    this.createdAt,
  });

  final int id;
  final String title;
  final String category;
  final String? description;
  final HirePartyModel? owner;
  final HireBusinessModel? business;
  final String? town;
  final String? area;
  final String? address;
  final double? latitude;
  final double? longitude;
  final HirePricingModel? prices;
  final String? deposit;
  final String? replacementValue;
  final bool deliveryAvailable;
  final bool pickupAvailable;
  final String? condition;
  final String? status;
  final String? verificationStatus;
  final List<String> images;
  final List<String> rules;
  final List<String> includedItems;
  final double? rating;
  final int? bookingsCount;
  final HireAvailabilitySummaryModel? availabilitySummary;
  final String? createdAt;

  bool get isAvailable => availabilitySummary?.available ?? true;
  bool get isRequestedWindowAvailable =>
      availabilitySummary?.requestedWindowAvailable ?? true;

  factory HireItemModel.fromJson(Map<String, dynamic> json) {
    return HireItemModel(
      id: json['id'] as int,
      title: (json['title'] ?? 'Hire item').toString(),
      category: (json['category'] ?? 'general').toString(),
      description: json['description'] as String?,
      owner: (json['owner'] as Map<String, dynamic>?) == null
          ? null
          : HirePartyModel.fromJson(json['owner'] as Map<String, dynamic>),
      business: (json['business'] as Map<String, dynamic>?) == null
          ? null
          : HireBusinessModel.fromJson(
              json['business'] as Map<String, dynamic>,
            ),
      town: json['town'] as String?,
      area: json['area'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      prices: (json['prices'] as Map<String, dynamic>?) == null
          ? null
          : HirePricingModel.fromJson(json['prices'] as Map<String, dynamic>),
      deposit: json['deposit']?.toString(),
      replacementValue: json['replacement_value']?.toString(),
      deliveryAvailable: json['delivery_available'] as bool? ?? false,
      pickupAvailable: json['pickup_available'] as bool? ?? true,
      condition: json['condition'] as String?,
      status: json['status'] as String?,
      verificationStatus: json['verification_status'] as String?,
      images: (json['images'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      rules: (json['rules'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      includedItems: (json['included_items'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      rating: (json['rating'] as num?)?.toDouble(),
      bookingsCount: (json['bookings_count'] as num?)?.toInt(),
      availabilitySummary:
          (json['availability_summary'] as Map<String, dynamic>?) == null
          ? null
          : HireAvailabilitySummaryModel.fromJson(
              json['availability_summary'] as Map<String, dynamic>,
            ),
      createdAt: json['created_at'] as String?,
    );
  }
}

class HireBookingTotalsModel {
  HireBookingTotalsModel({
    this.rentalFee,
    this.depositAmount,
    this.deliveryFee,
    this.total,
  });

  final String? rentalFee;
  final String? depositAmount;
  final String? deliveryFee;
  final String? total;

  factory HireBookingTotalsModel.fromJson(Map<String, dynamic> json) {
    return HireBookingTotalsModel(
      rentalFee: json['rental_fee']?.toString(),
      depositAmount: json['deposit_amount']?.toString(),
      deliveryFee: json['delivery_fee']?.toString(),
      total: json['total']?.toString(),
    );
  }
}

class HireDeliveryInfoModel {
  HireDeliveryInfoModel({
    this.address,
    this.latitude,
    this.longitude,
  });

  final String? address;
  final double? latitude;
  final double? longitude;

  factory HireDeliveryInfoModel.fromJson(Map<String, dynamic> json) {
    return HireDeliveryInfoModel(
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
}

class HireTimelineStepModel {
  HireTimelineStepModel({
    required this.key,
    required this.label,
    this.timestamp,
    this.isComplete = false,
    this.isCurrent = false,
  });

  final String key;
  final String label;
  final String? timestamp;
  final bool isComplete;
  final bool isCurrent;

  factory HireTimelineStepModel.fromJson(Map<String, dynamic> json) {
    return HireTimelineStepModel(
      key: (json['key'] ?? 'status').toString(),
      label: (json['label'] ?? 'Status').toString(),
      timestamp: json['timestamp'] as String?,
      isComplete: json['is_complete'] as bool? ?? false,
      isCurrent: json['is_current'] as bool? ?? false,
    );
  }
}

class HireBookingModel {
  HireBookingModel({
    required this.id,
    required this.status,
    this.referenceCode,
    this.item,
    this.customer,
    this.owner,
    this.courier,
    this.statusLabel,
    this.startAt,
    this.endAt,
    this.quantity = 1,
    this.totals,
    this.paymentStatus,
    this.pickupMethod,
    this.deliveryInfo,
    this.timeline = const [],
    this.nextAction,
    this.notes,
    this.ownerNotes,
    this.customerRating,
    this.customerRatingComment,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final String status;
  final String? referenceCode;
  final HireItemModel? item;
  final HirePartyModel? customer;
  final HirePartyModel? owner;
  final HirePartyModel? courier;
  final String? statusLabel;
  final String? startAt;
  final String? endAt;
  final int quantity;
  final HireBookingTotalsModel? totals;
  final String? paymentStatus;
  final String? pickupMethod;
  final HireDeliveryInfoModel? deliveryInfo;
  final List<HireTimelineStepModel> timeline;
  final String? nextAction;
  final String? notes;
  final String? ownerNotes;
  final int? customerRating;
  final String? customerRatingComment;
  final String? createdAt;
  final String? updatedAt;

  bool get canCancel =>
      status == 'pending' || status == 'accepted' || status == 'confirmed';
  bool get canMarkReturned =>
      status == 'handed_over' || status == 'in_use' || status == 'return_due';

  factory HireBookingModel.fromJson(Map<String, dynamic> json) {
    return HireBookingModel(
      id: json['id'] as int,
      status: (json['status'] ?? 'pending').toString(),
      referenceCode: json['reference_code'] as String?,
      item: (json['item'] as Map<String, dynamic>?) == null
          ? null
          : HireItemModel.fromJson(json['item'] as Map<String, dynamic>),
      customer: (json['customer'] as Map<String, dynamic>?) == null
          ? null
          : HirePartyModel.fromJson(json['customer'] as Map<String, dynamic>),
      owner: (json['owner'] as Map<String, dynamic>?) == null
          ? null
          : HirePartyModel.fromJson(json['owner'] as Map<String, dynamic>),
      courier: (json['courier'] as Map<String, dynamic>?) == null
          ? null
          : HirePartyModel.fromJson(json['courier'] as Map<String, dynamic>),
      statusLabel: json['status_label'] as String?,
      startAt: json['start_at'] as String?,
      endAt: json['end_at'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      totals: (json['totals'] as Map<String, dynamic>?) == null
          ? null
          : HireBookingTotalsModel.fromJson(
              json['totals'] as Map<String, dynamic>,
            ),
      paymentStatus: json['payment_status'] as String?,
      pickupMethod: json['pickup_method'] as String?,
      deliveryInfo: (json['delivery_info'] as Map<String, dynamic>?) == null
          ? null
          : HireDeliveryInfoModel.fromJson(
              json['delivery_info'] as Map<String, dynamic>,
            ),
      timeline: (json['timeline'] as List<dynamic>? ?? const [])
          .map(
            (item) => HireTimelineStepModel.fromJson(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
      nextAction: json['next_action'] as String?,
      notes: json['notes'] as String?,
      ownerNotes: json['owner_notes'] as String?,
      customerRating: (json['customer_rating'] as num?)?.toInt(),
      customerRatingComment: json['customer_rating_comment'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }
}

class SaleAlertModel {
  SaleAlertModel({
    required this.id,
    required this.title,
    required this.body,
    this.location,
    this.organizationId,
    this.publishedAt,
  });

  final int id;
  final String title;
  final String body;
  final String? location;
  final int? organizationId;
  final DateTime? publishedAt;

  factory SaleAlertModel.fromJson(Map<String, dynamic> json) {
    return SaleAlertModel(
      id: json['id'] as int,
      title: json['title'] as String? ?? 'Sale alert',
      body: json['body'] as String? ?? 'A local promotion is available now.',
      location: json['location'] as String?,
      organizationId: json['organization_id'] as int?,
      publishedAt: json['published_at'] == null ? null : DateTime.tryParse(json['published_at'].toString()),
    );
  }
}

class AccommodationItemModel {
  AccommodationItemModel({
    required this.id,
    required this.type,
    required this.title,
    required this.price,
    this.description,
    this.pricePeriod,
    this.bedrooms,
    this.bathrooms,
    this.location,
    this.town,
    this.area,
    this.imageUrl,
    this.status,
    this.createdAt,
    this.metadata,
    this.ownerName,
    this.ownerPhone,
    this.ownerWhatsapp,
    this.ownerAvatar,
    this.ownerLocation,
    this.ownerVerified = false,
    this.businessId,
    this.businessName,
    this.businessPhone,
    this.businessWhatsapp,
    this.businessLogoUrl,
    this.businessVerified = false,
    this.userId,
    this.userName,
    this.userPhone,
    this.userWhatsapp,
    this.userAvatar,
  });

  final int id;
  final String type;
  final String title;
  final String price;
  final String? description;
  final String? pricePeriod;
  final int? bedrooms;
  final int? bathrooms;
  final String? location;
  final String? town;
  final String? area;
  final String? imageUrl;
  final String? status;
  final String? createdAt;
  final Map<String, dynamic>? metadata;
  final String? ownerName;
  final String? ownerPhone;
  final String? ownerWhatsapp;
  final String? ownerAvatar;
  final String? ownerLocation;
  final bool ownerVerified;
  final int? businessId;
  final String? businessName;
  final String? businessPhone;
  final String? businessWhatsapp;
  final String? businessLogoUrl;
  final bool businessVerified;
  final int? userId;
  final String? userName;
  final String? userPhone;
  final String? userWhatsapp;
  final String? userAvatar;

  factory AccommodationItemModel.fromJson(Map<String, dynamic> json) {
    final owner = json['owner'] as Map<String, dynamic>?;
    final business = json['business'] as Map<String, dynamic>?;
    final user = json['user'] as Map<String, dynamic>?;
    return AccommodationItemModel(
      id: json['id'] as int,
      type: json['type'] as String,
      title: json['title'] as String,
      price: json['price'].toString(),
      description: json['description'] as String?,
      pricePeriod: json['price_period'] as String?,
      bedrooms: json['bedrooms'] as int?,
      bathrooms: json['bathrooms'] as int?,
      location: json['location'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      imageUrl: json['image_url'] as String?,
      status: json['status'] as String?,
      createdAt: json['created_at'] as String?,
      metadata: (json['metadata'] as Map?)?.cast<String, dynamic>(),
      ownerName: owner?['name'] as String?,
      ownerPhone: owner?['phone'] as String?,
      ownerWhatsapp: owner?['whatsapp'] as String?,
      ownerAvatar: owner?['avatar'] as String?,
      ownerLocation: owner?['location'] as String?,
      ownerVerified: owner?['is_verified'] == true,
      businessId: business?['id'] as int?,
      businessName: business?['name'] as String?,
      businessPhone: business?['phone'] as String?,
      businessWhatsapp: business?['whatsapp'] as String?,
      businessLogoUrl: business?['logo_url'] as String?,
      businessVerified: business?['is_verified'] == true,
      userId: user?['id'] as int?,
      userName: user?['name'] as String?,
      userPhone: user?['phone'] as String?,
      userWhatsapp: user?['whatsapp'] as String?,
      userAvatar: user?['avatar'] as String?,
    );
  }
}

class NotificationItemModel {
  NotificationItemModel({
    required this.id,
    required this.title,
    required this.body,
    this.type,
    this.targetType,
    this.targetId,
    this.target,
    this.readAt,
    this.createdAt,
  });

  final String id;
  final String title;
  final String body;
  final String? type;
  final String? targetType;
  final String? targetId;
  final NotificationTargetModel? target;
  final String? readAt;
  final String? createdAt;

  factory NotificationItemModel.fromJson(Map<String, dynamic> json) {
    final data = Map<String, dynamic>.from(json['data'] as Map? ?? const {});
    return NotificationItemModel(
      id: json['id'].toString(),
      type: json['type']?.toString() ?? data['type']?.toString(),
      title: json['title']?.toString() ?? data['title']?.toString() ?? json['type']?.toString() ?? 'Notification',
      body: json['body']?.toString() ?? data['body']?.toString() ?? data['message']?.toString() ?? 'You have an update.',
      targetType: json['target_type']?.toString() ?? data['target_type']?.toString(),
      targetId: json['target_id']?.toString() ?? data['target_id']?.toString(),
      target: (json['target'] as Map<String, dynamic>?) == null
          ? null
          : NotificationTargetModel.fromJson(json['target'] as Map<String, dynamic>),
      readAt: json['read_at'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
}

class NotificationTargetModel {
  NotificationTargetModel({
    this.id,
    this.type,
    this.href,
    this.externalUrl,
    this.sourceName,
    this.title,
  });

  final String? id;
  final String? type;
  final String? href;
  final String? externalUrl;
  final String? sourceName;
  final String? title;

  factory NotificationTargetModel.fromJson(Map<String, dynamic> json) {
    return NotificationTargetModel(
      id: json['id']?.toString(),
      type: json['type']?.toString(),
      href: json['href']?.toString(),
      externalUrl: json['external_url']?.toString(),
      sourceName: json['source_name']?.toString(),
      title: json['title']?.toString(),
    );
  }
}

class SosModel {
  SosModel({
    required this.id,
    required this.message,
    this.location,
    this.emergencyType,
    this.town,
    this.area,
    this.status,
    this.createdAt,
    this.userName,
    this.userPhone,
  });

  final int id;
  final String message;
  final String? location;
  final String? emergencyType;
  final String? town;
  final String? area;
  final String? status;
  final String? createdAt;
  final String? userName;
  final String? userPhone;

  factory SosModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return SosModel(
      id: json['id'] as int,
      message: json['message'] as String,
      location: json['location'] as String?,
      emergencyType: json['emergency_type'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      status: json['status']?.toString(),
      createdAt: json['created_at'] as String?,
      userName: user?['name'] as String?,
      userPhone: user?['phone'] as String?,
    );
  }
}

class ProfileSummaryModel {
  ProfileSummaryModel({
    required this.user,
    required this.completionPercentage,
    this.savedAddresses = const [],
    this.profile = const {},
    this.stats = const {},
  });

  final UserModel user;
  final int completionPercentage;
  final List<String> savedAddresses;
  final Map<String, dynamic> profile;
  final Map<String, int> stats;

  factory ProfileSummaryModel.fromJson(Map<String, dynamic> json) {
    final userJson = (json['user'] as Map<String, dynamic>)['data']
            as Map<String, dynamic>? ??
        json['user'] as Map<String, dynamic>;

    return ProfileSummaryModel(
      user: UserModel.fromJson(userJson),
      completionPercentage:
          (json['enrichment'] as Map<String, dynamic>?)?['percentage'] as int? ??
          0,
      profile: Map<String, dynamic>.from(
        (userJson['profile'] as Map<String, dynamic>?)?['data']
                as Map<String, dynamic>? ??
            userJson['profile'] as Map<String, dynamic>? ??
            const {},
      ),
      savedAddresses: (json['saved_addresses'] as List<dynamic>? ?? const [])
          .map((item) => (item as Map<String, dynamic>)['label']?.toString() ?? '')
          .where((item) => item.isNotEmpty)
          .toList(),
      stats: ((json['stats'] as Map<String, dynamic>?) ?? const {})
          .map((key, value) => MapEntry(key, (value as num?)?.toInt() ?? 0)),
    );
  }
}

class RoleApplicationModel {
  RoleApplicationModel({
    required this.id,
    required this.requestedRole,
    required this.status,
    required this.fullName,
    required this.phone,
    this.email,
    this.townName,
    this.address,
    this.licenseNumber,
    this.vehicleRegistration,
    this.vehicleType,
    this.rejectionReason,
    this.submittedAt,
  });

  final int id;
  final String requestedRole;
  final String status;
  final String fullName;
  final String phone;
  final String? email;
  final String? townName;
  final String? address;
  final String? licenseNumber;
  final String? vehicleRegistration;
  final String? vehicleType;
  final String? rejectionReason;
  final String? submittedAt;

  factory RoleApplicationModel.fromJson(Map<String, dynamic> json) {
    return RoleApplicationModel(
      id: json['id'] as int,
      requestedRole: json['requested_role']?.toString() ?? 'citizen',
      status: json['status']?.toString() ?? 'draft',
      fullName: json['full_name']?.toString() ?? 'Applicant',
      phone: json['phone']?.toString() ?? '',
      email: json['email'] as String?,
      townName: json['town_name'] as String?,
      address: json['address'] as String?,
      licenseNumber: json['license_number'] as String?,
      vehicleRegistration: json['vehicle_registration'] as String?,
      vehicleType: json['vehicle_type'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      submittedAt: json['submitted_at'] as String?,
    );
  }
}

class ModeSummaryModel {
  ModeSummaryModel({
    required this.currentMode,
    this.availableModes = const [],
    this.pendingModes = const [],
    this.canApplyFor = const [],
  });

  final String currentMode;
  final List<String> availableModes;
  final List<RoleApplicationModel> pendingModes;
  final List<String> canApplyFor;

  factory ModeSummaryModel.fromJson(Map<String, dynamic> json) {
    return ModeSummaryModel(
      currentMode: json['current_mode']?.toString() ?? 'citizen',
      availableModes: (json['available_modes'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      pendingModes: (json['pending_modes'] as List<dynamic>? ?? const [])
          .map((item) => RoleApplicationModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      canApplyFor: (json['can_apply_for'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
    );
  }
}

class CommunityProjectCategoryModel {
  CommunityProjectCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.sortOrder = 0,
  });

  final int id;
  final String name;
  final String slug;
  final String? icon;
  final int sortOrder;

  factory CommunityProjectCategoryModel.fromJson(Map<String, dynamic> json) {
    return CommunityProjectCategoryModel(
      id: json['id'] as int,
      name: (json['name'] ?? 'Category').toString(),
      slug: (json['slug'] ?? '').toString(),
      icon: json['icon'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
    );
  }
}

class CommunityProjectAttachmentModel {
  CommunityProjectAttachmentModel({
    required this.id,
    this.fileUrl,
    this.filePath,
    this.mimeType,
    this.fileType = 'image',
    this.originalName,
    this.size = 0,
    this.caption,
  });

  final int id;
  final String? fileUrl;
  final String? filePath;
  final String? mimeType;
  final String fileType;
  final String? originalName;
  final int size;
  final String? caption;

  factory CommunityProjectAttachmentModel.fromJson(Map<String, dynamic> json) {
    return CommunityProjectAttachmentModel(
      id: json['id'] as int,
      fileUrl: json['file_url'] as String?,
      filePath: json['file_path'] as String?,
      mimeType: json['mime_type'] as String?,
      fileType: (json['file_type'] ?? 'image').toString(),
      originalName: json['original_name'] as String?,
      size: (json['size'] as num?)?.toInt() ?? 0,
      caption: json['caption'] as String?,
    );
  }
}

class CommunityProjectVerificationModel {
  CommunityProjectVerificationModel({
    required this.id,
    required this.action,
    this.notes,
    this.statusAfter,
    this.verificationStatusAfter,
    this.createdAt,
    this.reviewer,
  });

  final int id;
  final String action;
  final String? notes;
  final String? statusAfter;
  final String? verificationStatusAfter;
  final String? createdAt;
  final Map<String, dynamic>? reviewer;

  factory CommunityProjectVerificationModel.fromJson(Map<String, dynamic> json) {
    return CommunityProjectVerificationModel(
      id: json['id'] as int,
      action: (json['action'] ?? 'submitted').toString(),
      notes: json['notes'] as String?,
      statusAfter: json['status_after'] as String?,
      verificationStatusAfter: json['verification_status_after'] as String?,
      createdAt: json['created_at'] as String?,
      reviewer: (json['reviewer'] as Map?)?.cast<String, dynamic>(),
    );
  }
}

class CommunityProjectUpdateModel {
  CommunityProjectUpdateModel({
    required this.id,
    required this.title,
    required this.body,
    this.statusAfterUpdate,
    this.progressPercent,
    this.approvedByTownManager = true,
    this.attachments = const [],
    this.createdAt,
    this.user,
  });

  final int id;
  final String title;
  final String body;
  final String? statusAfterUpdate;
  final int? progressPercent;
  final bool approvedByTownManager;
  final List<Map<String, dynamic>> attachments;
  final String? createdAt;
  final Map<String, dynamic>? user;

  factory CommunityProjectUpdateModel.fromJson(Map<String, dynamic> json) {
    return CommunityProjectUpdateModel(
      id: json['id'] as int,
      title: (json['title'] ?? 'Update').toString(),
      body: (json['body'] ?? '').toString(),
      statusAfterUpdate: json['status_after_update'] as String?,
      progressPercent: (json['progress_percent'] as num?)?.toInt(),
      approvedByTownManager: json['approved_by_town_manager'] as bool? ?? true,
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList(),
      createdAt: json['created_at'] as String?,
      user: (json['user'] as Map?)?.cast<String, dynamic>(),
    );
  }
}

class CommunityProjectPledgeModel {
  CommunityProjectPledgeModel({
    required this.id,
    required this.pledgeType,
    required this.pledgeDescription,
    this.amount,
    this.quantity,
    this.contactPhone,
    this.contactEmail,
    this.status,
    this.createdAt,
    this.user,
    this.project,
  });

  final int id;
  final String pledgeType;
  final String pledgeDescription;
  final String? amount;
  final int? quantity;
  final String? contactPhone;
  final String? contactEmail;
  final String? status;
  final String? createdAt;
  final Map<String, dynamic>? user;
  final CommunityProjectModel? project;

  factory CommunityProjectPledgeModel.fromJson(Map<String, dynamic> json) {
    return CommunityProjectPledgeModel(
      id: json['id'] as int,
      pledgeType: (json['pledge_type'] ?? 'other').toString(),
      pledgeDescription: (json['pledge_description'] ?? '').toString(),
      amount: json['amount']?.toString(),
      quantity: (json['quantity'] as num?)?.toInt(),
      contactPhone: json['contact_phone'] as String?,
      contactEmail: json['contact_email'] as String?,
      status: json['status']?.toString(),
      createdAt: json['created_at'] as String?,
      user: (json['user'] as Map?)?.cast<String, dynamic>(),
      project: (json['project'] as Map<String, dynamic>?) == null
          ? null
          : CommunityProjectModel.fromJson(
              json['project'] as Map<String, dynamic>,
            ),
    );
  }
}

class CommunityProjectModel {
  CommunityProjectModel({
    required this.id,
    required this.slug,
    required this.referenceCode,
    required this.title,
    required this.summary,
    required this.description,
    this.supportNeeded = const [],
    this.targetAmount,
    this.targetItems = const [],
    this.targetVolunteers,
    this.currentAmount,
    this.currentItems = const [],
    this.currentVolunteers,
    this.locationText,
    this.town,
    this.area,
    this.contactName,
    this.contactPhone,
    this.contactWhatsapp,
    this.contactEmail,
    this.status = 'draft',
    this.verificationStatus = 'pending',
    this.verificationNotes,
    this.rejectionReason,
    this.isVerified = false,
    this.isFeatured = false,
    this.startsAt,
    this.endsAt,
    this.approvedAt,
    this.completedAt,
    this.createdAt,
    this.updatedAt,
    this.progressPercent = 0,
    this.followersCount = 0,
    this.pledgesCount = 0,
    this.isFollowing = false,
    this.category,
    this.user,
    this.organization,
    this.attachments = const [],
    this.updates = const [],
    this.latestUpdate,
    this.pledges = const [],
    this.verificationHistory = const [],
  });

  final int id;
  final String slug;
  final String referenceCode;
  final String title;
  final String summary;
  final String description;
  final List<String> supportNeeded;
  final String? targetAmount;
  final List<Map<String, dynamic>> targetItems;
  final int? targetVolunteers;
  final String? currentAmount;
  final List<Map<String, dynamic>> currentItems;
  final int? currentVolunteers;
  final String? locationText;
  final String? town;
  final String? area;
  final String? contactName;
  final String? contactPhone;
  final String? contactWhatsapp;
  final String? contactEmail;
  final String status;
  final String verificationStatus;
  final String? verificationNotes;
  final String? rejectionReason;
  final bool isVerified;
  final bool isFeatured;
  final String? startsAt;
  final String? endsAt;
  final String? approvedAt;
  final String? completedAt;
  final String? createdAt;
  final String? updatedAt;
  final int progressPercent;
  final int followersCount;
  final int pledgesCount;
  final bool isFollowing;
  final CommunityProjectCategoryModel? category;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? organization;
  final List<CommunityProjectAttachmentModel> attachments;
  final List<CommunityProjectUpdateModel> updates;
  final CommunityProjectUpdateModel? latestUpdate;
  final List<CommunityProjectPledgeModel> pledges;
  final List<CommunityProjectVerificationModel> verificationHistory;

  factory CommunityProjectModel.fromJson(Map<String, dynamic> json) {
    return CommunityProjectModel(
      id: json['id'] as int,
      slug: (json['slug'] ?? '').toString(),
      referenceCode: (json['reference_code'] ?? '').toString(),
      title: (json['title'] ?? 'Project').toString(),
      summary: (json['summary'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      supportNeeded: (json['support_needed'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      targetAmount: json['target_amount']?.toString(),
      targetItems: (json['target_items'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList(),
      targetVolunteers: (json['target_volunteers'] as num?)?.toInt(),
      currentAmount: json['current_amount']?.toString(),
      currentItems: (json['current_items'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList(),
      currentVolunteers: (json['current_volunteers'] as num?)?.toInt(),
      locationText: json['location_text'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
      contactName: json['contact_name'] as String?,
      contactPhone: json['contact_phone'] as String?,
      contactWhatsapp: json['contact_whatsapp'] as String?,
      contactEmail: json['contact_email'] as String?,
      status: (json['status'] ?? 'draft').toString(),
      verificationStatus: (json['verification_status'] ?? 'pending').toString(),
      verificationNotes: json['verification_notes'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      isVerified: json['is_verified'] as bool? ?? false,
      isFeatured: json['is_featured'] as bool? ?? false,
      startsAt: json['starts_at'] as String?,
      endsAt: json['ends_at'] as String?,
      approvedAt: json['approved_at'] as String?,
      completedAt: json['completed_at'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      progressPercent: (json['progress_percent'] as num?)?.toInt() ?? 0,
      followersCount: (json['followers_count'] as num?)?.toInt() ?? 0,
      pledgesCount: (json['pledges_count'] as num?)?.toInt() ?? 0,
      isFollowing: json['is_following'] as bool? ?? false,
      category: (json['category'] as Map<String, dynamic>?) == null
          ? null
          : CommunityProjectCategoryModel.fromJson(
              json['category'] as Map<String, dynamic>,
            ),
      user: (json['user'] as Map?)?.cast<String, dynamic>(),
      organization: (json['organization'] as Map?)?.cast<String, dynamic>(),
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .map(
            (item) => CommunityProjectAttachmentModel.fromJson(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
      updates: (json['updates'] as List<dynamic>? ?? const [])
          .map(
            (item) => CommunityProjectUpdateModel.fromJson(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
      latestUpdate: (json['latest_update'] as Map<String, dynamic>?) == null
          ? null
          : CommunityProjectUpdateModel.fromJson(
              json['latest_update'] as Map<String, dynamic>,
            ),
      pledges: (json['pledges'] as List<dynamic>? ?? const [])
          .map(
            (item) => CommunityProjectPledgeModel.fromJson(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
      verificationHistory:
          (json['verification_history'] as List<dynamic>? ?? const [])
              .map(
                (item) => CommunityProjectVerificationModel.fromJson(
                  item as Map<String, dynamic>,
                ),
              )
              .toList(),
    );
  }
}
