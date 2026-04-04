from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Follow, FriendRequest, Friendship

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        # We handle setting None if empty
        if user.profile_photo:
            token['profile_photo'] = user.profile_photo.url
        else:
            token['profile_photo'] = None
            
        token['role'] = user.role
        
        return token

class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_photo', 'bio', 'role')
        read_only_fields = ('id', 'email')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.profile_photo and request:
            data['profile_photo'] = request.build_absolute_uri(instance.profile_photo.url)
        elif not instance.profile_photo:
            data['profile_photo'] = None
        return data


class DirectoryUserSerializer(UserSerializer):
    is_friend = serializers.BooleanField(read_only=True)
    is_following = serializers.BooleanField(read_only=True)
    incoming_request_id = serializers.IntegerField(read_only=True, allow_null=True)
    outgoing_request_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + (
            'is_friend',
            'is_following',
            'incoming_request_id',
            'outgoing_request_id',
        )

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'follower', 'following', 'created_at')


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ('id', 'sender', 'receiver', 'created_at')


class FriendshipSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ('id', 'user1', 'user2', 'created_at')
