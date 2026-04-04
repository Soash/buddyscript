from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, Follow, FriendRequest, Friendship

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Fields to display in the admin list view
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'role')
    list_filter = ('is_staff', 'is_active', 'role')
    
    # Fields for search functionality
    search_fields = ('email', 'first_name', 'last_name', 'role')
    
    # Ordering in admin
    ordering = ('email',)
    
    # Fields displayed when editing user
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'bio', 'profile_photo', 'role')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Fields displayed when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('id', 'follower', 'following', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('follower__email', 'following__email')
    autocomplete_fields = ('follower', 'following')
    ordering = ('-created_at',)
    list_select_related = ('follower', 'following')


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('sender__email', 'receiver__email')
    autocomplete_fields = ('sender', 'receiver')
    ordering = ('-created_at',)
    list_select_related = ('sender', 'receiver')


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user1__email', 'user2__email')
    autocomplete_fields = ('user1', 'user2')
    ordering = ('-created_at',)
    list_select_related = ('user1', 'user2')