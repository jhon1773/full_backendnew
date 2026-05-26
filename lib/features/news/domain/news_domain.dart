import 'package:equatable/equatable.dart';

enum NewsStatus { draft, published, unpublished }

class NewsArticle extends Equatable {
  const NewsArticle({
    required this.id,
    required this.title,
    required this.summary,
    required this.content,
    required this.country,
    required this.author,
    required this.status,
    this.imageUrl,
  });

  final String id;
  final String title;
  final String summary;
  final String content;
  final String country;
  final String author;
  final NewsStatus status;
  final String? imageUrl;

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    return NewsArticle(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      summary: json['summary']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      author: json['author']?.toString() ?? '',
      status: _parseStatus(json['status']?.toString()),
      imageUrl: json['image_url']?.toString() ?? json['imageUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'title': title,
        'summary': summary,
        'content': content,
        'country': country,
        'author': author,
      'status': _statusToApi(status),
      'image_url': imageUrl,
      };

  static NewsStatus _parseStatus(String? value) {
    switch (value) {
      case 'publicado':
      case 'published':
        return NewsStatus.published;
      case 'despublicado':
      case 'unpublished':
        return NewsStatus.unpublished;
      default:
        return NewsStatus.draft;
    }
  }

  static String _statusToApi(NewsStatus status) {
    switch (status) {
      case NewsStatus.published:
        return 'publicado';
      case NewsStatus.unpublished:
      case NewsStatus.draft:
        return 'borrador';
    }
  }

  @override
  List<Object?> get props => [id, title, summary, content, country, author, status, imageUrl];
}

abstract class NewsRepository {
  Future<List<NewsArticle>> listNews({String? country, NewsStatus? status, String? query});
  Future<void> save(NewsArticle article);
  Future<void> delete(String id);
  Future<void> setStatus(String id, NewsStatus status);
}

class ListNewsUseCase {
  const ListNewsUseCase(this._repository);
  final NewsRepository _repository;
  Future<List<NewsArticle>> call({String? country, NewsStatus? status, String? query}) => _repository.listNews(country: country, status: status, query: query);
}

class SaveNewsArticleUseCase {
  const SaveNewsArticleUseCase(this._repository);
  final NewsRepository _repository;
  Future<void> call(NewsArticle article) => _repository.save(article);
}

class DeleteNewsArticleUseCase {
  const DeleteNewsArticleUseCase(this._repository);
  final NewsRepository _repository;
  Future<void> call(String id) => _repository.delete(id);
}

class SetNewsStatusUseCase {
  const SetNewsStatusUseCase(this._repository);
  final NewsRepository _repository;
  Future<void> call(String id, NewsStatus status) => _repository.setStatus(id, status);
}