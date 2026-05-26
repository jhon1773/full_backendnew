class SessionSnapshot {
  const SessionSnapshot({
    required this.accessToken,
    required this.expiryAt,
    required this.user,
    this.refreshToken,
  });

  final String accessToken;
  final String? refreshToken;
  final DateTime expiryAt;
  final Map<String, dynamic> user;

  bool get isExpired => DateTime.now().isAfter(expiryAt);

  Map<String, dynamic> toJson() => <String, dynamic>{
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'expiryAt': expiryAt.toIso8601String(),
        'user': user,
      };

  factory SessionSnapshot.fromJson(Map<String, dynamic> json) {
    return SessionSnapshot(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String?,
      expiryAt: DateTime.parse(json['expiryAt'] as String),
      user: Map<String, dynamic>.from(json['user'] as Map),
    );
  }
}