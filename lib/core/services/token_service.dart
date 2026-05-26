import 'dart:async';

import '../models/session_snapshot.dart';
import 'secure_storage_service.dart';

class TokenService {
  TokenService(this._secureStorageService);

  static const String _sessionKey = 'cms_admin_session';
  final SecureStorageService _secureStorageService;
  final StreamController<SessionSnapshot?> _sessionController = StreamController<SessionSnapshot?>.broadcast();
  Timer? _expiryTimer;

  Stream<SessionSnapshot?> get sessionStream => _sessionController.stream;

  Future<void> persistSession(SessionSnapshot snapshot) async {
    await _secureStorageService.writeJson(_sessionKey, snapshot.toJson());
    _scheduleExpiry(snapshot.expiryAt);
    _sessionController.add(snapshot);
  }

  Future<SessionSnapshot?> readSnapshot() async {
    final json = await _secureStorageService.readJson(_sessionKey);
    if (json == null) {
      return null;
    }

    final snapshot = SessionSnapshot.fromJson(json);
    if (snapshot.isExpired) {
      await clearSession();
      return null;
    }

    return snapshot;
  }

  Future<void> clearSession() async {
    _expiryTimer?.cancel();
    await _secureStorageService.delete(_sessionKey);
    _sessionController.add(null);
  }

  void _scheduleExpiry(DateTime expiryAt) {
    _expiryTimer?.cancel();
    final remaining = expiryAt.difference(DateTime.now());
    if (remaining.isNegative) {
      _sessionController.add(null);
      return;
    }

    _expiryTimer = Timer(remaining, () async {
      await clearSession();
    });
  }
}