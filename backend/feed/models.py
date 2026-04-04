from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Post(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Post by {self.author} at {self.created_at}"


class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='post_images/')
    caption = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return f"Image for Post {self.post_id} ({self.position})"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    likes_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Comment by {self.author} on Post {self.post_id}"

class PostLike(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('haha', 'Haha'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES, default='like', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

class CommentLike(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('haha', 'Haha'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES, default='like', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')
