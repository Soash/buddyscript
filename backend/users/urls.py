from django.urls import path
from .views import UserProfileUpdateView, UserDetailView, SuggestedUsersView, YouMightLikeView, UsersDirectoryView
from .views import (
    FollowToggleView,
    FollowersListView,
    FollowingListView,
    FriendsListView,
    SendFriendRequestView,
    IncomingFriendRequestsView,
    SentFriendRequestsView,
    AcceptFriendRequestView,
    DeclineFriendRequestView,
    CancelFriendRequestView,
    UnfriendView,
)

urlpatterns = [
    path('me/', UserProfileUpdateView.as_view(), name='user_profile_me'),
    path('suggested/', SuggestedUsersView.as_view(), name='user_suggested'),
    path('you-might-like/', YouMightLikeView.as_view(), name='user_you_might_like'),
    path('directory/', UsersDirectoryView.as_view(), name='user_directory'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('follow/<int:pk>/', FollowToggleView.as_view(), name='follow-toggle'),
    path('followers/', FollowersListView.as_view(), name='followers-list'),
    path('following/', FollowingListView.as_view(), name='following-list'),
    path('friends/', FriendsListView.as_view(), name='friends-list'),
    path('friend-requests/send/<int:pk>/', SendFriendRequestView.as_view(), name='friend-request-send'),
    path('friend-requests/incoming/', IncomingFriendRequestsView.as_view(), name='friend-requests-incoming'),
    path('friend-requests/sent/', SentFriendRequestsView.as_view(), name='friend-requests-sent'),
    path('friend-requests/<int:request_id>/accept/', AcceptFriendRequestView.as_view(), name='friend-request-accept'),
    path('friend-requests/<int:request_id>/decline/', DeclineFriendRequestView.as_view(), name='friend-request-decline'),
    path('friend-requests/<int:request_id>/cancel/', CancelFriendRequestView.as_view(), name='friend-request-cancel'),
    path('unfriend/<int:pk>/', UnfriendView.as_view(), name='unfriend'),
]
