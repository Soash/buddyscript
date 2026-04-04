from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import PostLike, CommentLike, Comment

@receiver(post_save, sender=PostLike)
@receiver(post_delete, sender=PostLike)
def update_post_likes_count(sender, instance, **kwargs):
    post = instance.post
    post.likes_count = post.likes.count()
    post.save(update_fields=['likes_count'])

@receiver(post_save, sender=CommentLike)
@receiver(post_delete, sender=CommentLike)
def update_comment_likes_count(sender, instance, **kwargs):
    comment = instance.comment
    comment.likes_count = comment.likes.count()
    comment.save(update_fields=['likes_count'])

@receiver(post_save, sender=Comment)
@receiver(post_delete, sender=Comment)
def update_post_comments_count(sender, instance, **kwargs):
    post = instance.post
    post.comments_count = post.comments.count()
    post.save(update_fields=['comments_count'])
