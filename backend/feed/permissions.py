from rest_framework.permissions import BasePermission


class IsPostAuthor(BasePermission):
    """Allow access only to the author of a Post object."""

    message = 'You do not have permission to modify this post.'

    def has_object_permission(self, request, view, obj):
        author_id = getattr(obj, 'author_id', None)
        user_id = getattr(request.user, 'id', None)
        return author_id is not None and user_id is not None and author_id == user_id
