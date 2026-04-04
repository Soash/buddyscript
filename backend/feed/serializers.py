from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Post, Comment, PostImage, PostLike, CommentLike
from users.serializers import UserSerializer


User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'profile_photo')

    def get_profile_photo(self, obj):
        request = self.context.get('request')
        if obj.profile_photo and request:
            return request.build_absolute_uri(obj.profile_photo.url)
        return None


class PostImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ['id', 'image', 'caption', 'position']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    user_reaction_type = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'parent', 'author', 'content', 'created_at', 'likes_count', 'is_liked_by_user', 'user_reaction_type']
        read_only_fields = ['likes_count']

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_user_reaction_type(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).values_list('reaction_type', flat=True).first()
        return None


class PostReactorSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = PostLike
        fields = ('user', 'reaction_type', 'created_at')


class CommentReactorSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = CommentLike
        fields = ('user', 'reaction_type', 'created_at')

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    user_reaction_type = serializers.SerializerMethodField()
    latest_reactors = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'image', 'images', 'visibility', 'created_at', 'likes_count', 'comments_count', 'is_liked_by_user', 'user_reaction_type', 'latest_reactors', 'comments']
        read_only_fields = ['likes_count', 'comments_count']

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_user_reaction_type(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).values_list('reaction_type', flat=True).first()
        return None

    def get_latest_reactors(self, obj):
        request = self.context.get('request')

        # Keep behavior consistent with existing likes visibility rule.
        if obj.visibility != 'public':
            return []

        qs = obj.likes.select_related('user').order_by('-created_at')[:5]
        return PostReactorSerializer(qs, many=True, context={'request': request}).data

    def get_image(self, obj):
        request = self.context.get('request')
        if not request:
            return None

        if obj.image:
            return request.build_absolute_uri(obj.image.url)

        if hasattr(obj, 'images'):
            first_obj = obj.images.all().first()
            if first_obj and first_obj.image:
                return request.build_absolute_uri(first_obj.image.url)

        return None

    def get_images(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'images'):
            images = list(obj.images.all())
            if images:
                return PostImageSerializer(images, many=True, context={'request': request}).data

        if obj.image and request:
            return [{'id': None, 'image': request.build_absolute_uri(obj.image.url), 'caption': '', 'position': 0}]

        return []
