from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)
    
    # Extended Profile fields
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    role = models.CharField(max_length=150, blank=True, default='')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following_relations',
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='follower_relations',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_follow_pair'),
            models.CheckConstraint(condition=~Q(follower=models.F('following')), name='prevent_self_follow'),
        ]
        indexes = [
            models.Index(fields=['follower', 'created_at']),
            models.Index(fields=['following', 'created_at']),
        ]

    def __str__(self):
        return f'{self.follower_id} -> {self.following_id}'


class FriendRequest(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_friend_requests',
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_friend_requests',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['sender', 'receiver'], name='unique_friend_request_pair'),
            models.CheckConstraint(condition=~Q(sender=models.F('receiver')), name='prevent_self_friend_request'),
        ]
        indexes = [
            models.Index(fields=['receiver', 'created_at']),
        ]

    def __str__(self):
        return f'{self.sender_id} -> {self.receiver_id}'


class Friendship(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friendships_as_user1',
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friendships_as_user2',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user1', 'user2'], name='unique_friendship_pair'),
            models.CheckConstraint(condition=~Q(user1=models.F('user2')), name='prevent_self_friendship'),
        ]
        indexes = [
            models.Index(fields=['user1', 'created_at']),
            models.Index(fields=['user2', 'created_at']),
        ]

    def save(self, *args, **kwargs):
        # Ensure (user1, user2) ordering is stable.
        if self.user1_id and self.user2_id and self.user1_id > self.user2_id:
            self.user1_id, self.user2_id = self.user2_id, self.user1_id
        super().save(*args, **kwargs)

    @staticmethod
    def are_friends(user_a_id, user_b_id):
        if user_a_id == user_b_id:
            return False
        a, b = (user_a_id, user_b_id) if user_a_id < user_b_id else (user_b_id, user_a_id)
        return Friendship.objects.filter(user1_id=a, user2_id=b).exists()

    def __str__(self):
        return f'{self.user1_id} <-> {self.user2_id}'
