class UserModel {
  UserModel({
    required this.id,
    required this.name,
    required this.phone,
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
    this.interests = const [],
    this.preferredRoles = const [],
    this.notificationPreferences = const {},
  });

  final String? defaultTown;
  final String? defaultArea;
  final List<String> interests;
  final List<String> preferredRoles;
  final Map<String, dynamic> notificationPreferences;

  factory UserPreferenceModel.fromJson(Map<String, dynamic> json) {
    return UserPreferenceModel(
      defaultTown: json['default_town'] as String?,
      defaultArea: json['default_area'] as String?,
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

class ServiceModel {
  ServiceModel({
    required this.id,
    required this.name,
    required this.durationMinutes,
    required this.price,
    this.description,
  });

  final int id;
  final String name;
  final int durationMinutes;
  final String price;
  final String? description;

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as int,
      name: json['name'] as String,
      durationMinutes: json['duration_minutes'] as int,
      price: json['price'].toString(),
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
    this.description,
    this.phone,
    this.avatarUrl,
    this.whatsapp,
    this.status = 'active',
    this.distanceKm,
    this.openingHours = const [],
    this.services = const [],
    this.availabilitySlots = const [],
  });

  final int id;
  final String name;
  final String category;
  final String location;
  final bool isVerified;
  final String status;
  final String? description;
  final String? phone;
  final String? avatarUrl;
  final String? whatsapp;
  final double? distanceKm;
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
      status: json['status']?.toString() ?? 'active',
      description: json['description'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      whatsapp: json['whatsapp'] as String?,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
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
    this.compensation,
    this.location,
    this.applicationsCount = 0,
    this.distanceKm,
  });

  final int id;
  final String title;
  final String description;
  final String employmentType;
  final String status;
  final String? compensation;
  final String? location;
  final int applicationsCount;
  final double? distanceKm;

  factory JobModel.fromJson(Map<String, dynamic> json) {
    return JobModel(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
      employmentType: json['employment_type'] as String,
      status: json['status']?.toString() ?? 'open',
      compensation: json['compensation']?.toString(),
      location: json['location'] as String?,
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
    this.distanceKm,
  });

  final int id;
  final String headline;
  final bool isAvailable;
  final String? name;
  final String? location;
  final String? rate;
  final List<String> skills;
  final double? distanceKm;

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    return WorkerModel(
      id: json['id'] as int,
      headline: json['headline'] as String,
      isAvailable: json['is_available'] as bool? ?? true,
      name: (json['user'] as Map<String, dynamic>?)?['name'] as String?,
      location: json['location'] as String?,
      rate: json['rate']?.toString(),
      skills: (json['skills'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
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
    this.openingHours = const [],
    this.servicesOffered = const [],
    this.followersCount,
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
  final List<Map<String, dynamic>> openingHours;
  final List<String> servicesOffered;
  final int? followersCount;

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
      openingHours: (json['opening_hours'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList(),
      servicesOffered: (json['services_offered'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      followersCount: json['followers_count'] as int?,
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
    this.photoUrl,
    this.status,
  });

  final int id;
  final String pickupAddress;
  final String dropoffAddress;
  final String itemDescription;
  final String? price;
  final String? parcelSize;
  final String? photoUrl;
  final String? status;

  factory DeliveryModel.fromJson(Map<String, dynamic> json) {
    return DeliveryModel(
      id: json['id'] as int,
      pickupAddress: (json['pickup_address'] ?? json['pickup_location'] ?? '') as String,
      dropoffAddress: (json['dropoff_address'] ?? json['dropoff_location'] ?? '') as String,
      itemDescription: (json['item_description'] ?? json['parcel_description'] ?? '') as String,
      price: json['estimated_price']?.toString() ?? json['price']?.toString(),
      parcelSize: json['parcel_size'] as String?,
      photoUrl: json['photo_url'] as String?,
      status: json['status']?.toString(),
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

class EventModel {
  EventModel({
    required this.id,
    required this.title,
    required this.category,
    this.description,
    this.location,
    this.startsAt,
  });

  final int id;
  final String title;
  final String category;
  final String? description;
  final String? location;
  final String? startsAt;

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'] as int,
      title: json['title'] as String,
      category: json['category']?.toString() ?? 'community',
      description: json['description'] as String?,
      location: json['location'] as String?,
      startsAt: json['starts_at'] as String?,
    );
  }
}

class RideModel {
  RideModel({
    required this.id,
    required this.pickupLocation,
    required this.dropoffLocation,
    this.fareEstimate,
  });

  final int id;
  final String pickupLocation;
  final String dropoffLocation;
  final String? fareEstimate;

  factory RideModel.fromJson(Map<String, dynamic> json) {
    return RideModel(
      id: json['id'] as int,
      pickupLocation: json['pickup_location'] as String,
      dropoffLocation: json['dropoff_location'] as String,
      fareEstimate: json['fare_estimate']?.toString(),
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
    this.businessName,
    this.userName,
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
  final String? businessName;
  final String? userName;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
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
      businessName: (json['business'] as Map<String, dynamic>?)?['name'] as String?,
      userName: (json['user'] as Map<String, dynamic>?)?['name'] as String?,
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

  factory AccommodationItemModel.fromJson(Map<String, dynamic> json) {
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
    );
  }
}

class NotificationItemModel {
  NotificationItemModel({
    required this.id,
    required this.title,
    required this.body,
    this.readAt,
    this.createdAt,
  });

  final String id;
  final String title;
  final String body;
  final String? readAt;
  final String? createdAt;

  factory NotificationItemModel.fromJson(Map<String, dynamic> json) {
    final data = Map<String, dynamic>.from(json['data'] as Map? ?? const {});
    return NotificationItemModel(
      id: json['id'].toString(),
      title: data['title']?.toString() ?? json['type']?.toString() ?? 'Notification',
      body: data['body']?.toString() ?? data['message']?.toString() ?? 'You have an update.',
      readAt: json['read_at'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
}

class SosModel {
  SosModel({
    required this.id,
    required this.message,
    this.location,
  });

  final int id;
  final String message;
  final String? location;

  factory SosModel.fromJson(Map<String, dynamic> json) {
    return SosModel(
      id: json['id'] as int,
      message: json['message'] as String,
      location: json['location'] as String?,
    );
  }
}

class ProfileSummaryModel {
  ProfileSummaryModel({
    required this.user,
    required this.completionPercentage,
    this.savedAddresses = const [],
    this.profile = const {},
  });

  final UserModel user;
  final int completionPercentage;
  final List<String> savedAddresses;
  final Map<String, dynamic> profile;

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
    );
  }
}
