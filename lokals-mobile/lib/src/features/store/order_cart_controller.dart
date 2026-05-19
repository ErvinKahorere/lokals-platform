import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/models.dart';

const _storageKey = 'lokals_mobile_order_cart';

class OrderCartItemModel {
  OrderCartItemModel({
    required this.productId,
    required this.title,
    required this.price,
    required this.quantity,
    this.sellerId,
    this.sellerName,
    this.imageUrl,
    this.town,
    this.area,
  });

  final int productId;
  final String title;
  final String price;
  final int quantity;
  final int? sellerId;
  final String? sellerName;
  final String? imageUrl;
  final String? town;
  final String? area;

  double get amount => double.tryParse(price) ?? 0;

  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'title': title,
        'price': price,
        'quantity': quantity,
        'seller_id': sellerId,
        'seller_name': sellerName,
        'image_url': imageUrl,
        'town': town,
        'area': area,
      };

  factory OrderCartItemModel.fromJson(Map<String, dynamic> json) {
    return OrderCartItemModel(
      productId: json['product_id'] as int,
      title: (json['title'] ?? 'Item').toString(),
      price: (json['price'] ?? 0).toString(),
      quantity: json['quantity'] as int? ?? 1,
      sellerId: json['seller_id'] as int?,
      sellerName: json['seller_name'] as String?,
      imageUrl: json['image_url'] as String?,
      town: json['town'] as String?,
      area: json['area'] as String?,
    );
  }

  OrderCartItemModel copyWith({int? quantity}) {
    return OrderCartItemModel(
      productId: productId,
      title: title,
      price: price,
      quantity: quantity ?? this.quantity,
      sellerId: sellerId,
      sellerName: sellerName,
      imageUrl: imageUrl,
      town: town,
      area: area,
    );
  }
}

class OrderCartState {
  const OrderCartState({this.items = const []});

  final List<OrderCartItemModel> items;

  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => items.fold(0, (sum, item) => sum + (item.amount * item.quantity));

  OrderCartState copyWith({List<OrderCartItemModel>? items}) {
    return OrderCartState(items: items ?? this.items);
  }
}

class OrderCartController extends Notifier<OrderCartState> {
  bool _hydrated = false;

  @override
  OrderCartState build() {
    if (!_hydrated) {
      _hydrated = true;
      _restore();
    }
    return const OrderCartState();
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) {
      return;
    }
    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      state = OrderCartState(
        items: decoded
            .map((item) => OrderCartItemModel.fromJson(Map<String, dynamic>.from(item as Map)))
            .toList(),
      );
    } catch (_) {
      state = const OrderCartState();
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _storageKey,
      jsonEncode(state.items.map((item) => item.toJson()).toList()),
    );
  }

  Future<void> addProduct(ProductModel product, {int quantity = 1}) async {
    final items = [...state.items];
    final index = items.indexWhere((item) => item.productId == product.id);
    if (index >= 0) {
      items[index] = items[index].copyWith(quantity: items[index].quantity + quantity);
    } else {
      items.add(
        OrderCartItemModel(
          productId: product.id,
          title: product.title,
          price: product.salePrice ?? product.price,
          quantity: quantity,
          sellerId: product.businessId,
          sellerName: product.businessName ?? product.userBusinessName ?? product.userName,
          imageUrl: product.imageUrl,
          town: product.town,
          area: product.area,
        ),
      );
    }
    state = state.copyWith(items: items);
    await _persist();
  }

  Future<void> updateQuantity(int productId, int quantity) async {
    final items = state.items
        .map((item) => item.productId == productId ? item.copyWith(quantity: quantity) : item)
        .where((item) => item.quantity > 0)
        .toList();
    state = state.copyWith(items: items);
    await _persist();
  }

  Future<void> clear() async {
    state = const OrderCartState();
    await _persist();
  }

  Future<void> remove(int productId) async {
    state = state.copyWith(
      items: state.items.where((item) => item.productId != productId).toList(),
    );
    await _persist();
  }
}

final orderCartProvider =
    NotifierProvider<OrderCartController, OrderCartState>(OrderCartController.new);
