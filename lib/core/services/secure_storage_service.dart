import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage}) : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  Future<void> writeJson(String key, Map<String, dynamic> value) async {
    await _storage.write(key: key, value: jsonEncode(value));
  }

  Future<Map<String, dynamic>?> readJson(String key) async {
    final value = await _storage.read(key: key);
    if (value == null || value.isEmpty) {
      return null;
    }

    return Map<String, dynamic>.from(jsonDecode(value) as Map);
  }

  Future<void> delete(String key) => _storage.delete(key: key);
}