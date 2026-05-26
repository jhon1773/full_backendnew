import 'package:equatable/equatable.dart';

enum TestimonialStatus { draft, published, unpublished }

class Testimonial extends Equatable {
  const Testimonial({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.text,
    required this.country,
    required this.status,
    this.instagram,
    this.facebook,
  });

  final String id;
  final String name;
  final String imageUrl;
  final String text;
  final String country;
  final TestimonialStatus status;
  final String? instagram;
  final String? facebook;

  factory Testimonial.fromJson(Map<String, dynamic> json) {
    return Testimonial(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      imageUrl: json['photo_url']?.toString() ?? json['imageUrl']?.toString() ?? json['image']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      status: _parseStatus(json['publication_status']?.toString() ?? json['status']?.toString()),
      instagram: json['instagram_url']?.toString() ?? json['instagram']?.toString(),
      facebook: json['facebook_url']?.toString() ?? json['facebook']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'name': name,
      'photo_url': imageUrl,
        'text': text,
        'country': country,
      'publication_status': _statusToApi(status),
      'instagram_url': instagram,
      'facebook_url': facebook,
      };

  static TestimonialStatus _parseStatus(String? value) {
    switch (value) {
      case 'publicado':
      case 'published':
        return TestimonialStatus.published;
      case 'despublicado':
      case 'unpublished':
        return TestimonialStatus.unpublished;
      default:
        return TestimonialStatus.draft;
    }
  }

  static String _statusToApi(TestimonialStatus status) {
    switch (status) {
      case TestimonialStatus.published:
        return 'publicado';
      case TestimonialStatus.unpublished:
        return 'despublicado';
      case TestimonialStatus.draft:
        return 'borrador';
    }
  }

  @override
  List<Object?> get props => [id, name, imageUrl, text, country, status, instagram, facebook];
}

abstract class TestimonialsRepository {
  Future<List<Testimonial>> listTestimonials({String? country, TestimonialStatus? status, String? query});
  Future<void> save(Testimonial testimonial, {String? localImagePath});
  Future<void> delete(String id);
  Future<void> setStatus(String id, TestimonialStatus status);
}

class ListTestimonialsUseCase {
  const ListTestimonialsUseCase(this._repository);
  final TestimonialsRepository _repository;
  Future<List<Testimonial>> call({String? country, TestimonialStatus? status, String? query}) {
    return _repository.listTestimonials(country: country, status: status, query: query);
  }
}

class SaveTestimonialUseCase {
  const SaveTestimonialUseCase(this._repository);
  final TestimonialsRepository _repository;
  Future<void> call(Testimonial testimonial, {String? localImagePath}) => _repository.save(testimonial, localImagePath: localImagePath);
}

class DeleteTestimonialUseCase {
  const DeleteTestimonialUseCase(this._repository);
  final TestimonialsRepository _repository;
  Future<void> call(String id) => _repository.delete(id);
}

class SetTestimonialStatusUseCase {
  const SetTestimonialStatusUseCase(this._repository);
  final TestimonialsRepository _repository;
  Future<void> call(String id, TestimonialStatus status) => _repository.setStatus(id, status);
}