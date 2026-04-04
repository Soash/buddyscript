from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_customuser_bio_customuser_profile_photo_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('follower', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='following_relations', to=settings.AUTH_USER_MODEL)),
                ('following', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='follower_relations', to=settings.AUTH_USER_MODEL)),
            ],
            options={},
        ),
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_friend_requests', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_friend_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={},
        ),
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friendships_as_user1', to=settings.AUTH_USER_MODEL)),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friendships_as_user2', to=settings.AUTH_USER_MODEL)),
            ],
            options={},
        ),
        migrations.AddIndex(
            model_name='follow',
            index=models.Index(fields=['follower', 'created_at'], name='users_follo_follower_6417dd_idx'),
        ),
        migrations.AddIndex(
            model_name='follow',
            index=models.Index(fields=['following', 'created_at'], name='users_follo_following_191f0f_idx'),
        ),
        migrations.AddConstraint(
            model_name='follow',
            constraint=models.UniqueConstraint(fields=('follower', 'following'), name='unique_follow_pair'),
        ),
        migrations.AddConstraint(
            model_name='follow',
            constraint=models.CheckConstraint(condition=~Q(follower=models.F('following')), name='prevent_self_follow'),
        ),
        migrations.AddIndex(
            model_name='friendrequest',
            index=models.Index(fields=['receiver', 'created_at'], name='users_frie_receiver_73e9a9_idx'),
        ),
        migrations.AddConstraint(
            model_name='friendrequest',
            constraint=models.UniqueConstraint(fields=('sender', 'receiver'), name='unique_friend_request_pair'),
        ),
        migrations.AddConstraint(
            model_name='friendrequest',
            constraint=models.CheckConstraint(condition=~Q(sender=models.F('receiver')), name='prevent_self_friend_request'),
        ),
        migrations.AddIndex(
            model_name='friendship',
            index=models.Index(fields=['user1', 'created_at'], name='users_frie_user1_8dcd7d_idx'),
        ),
        migrations.AddIndex(
            model_name='friendship',
            index=models.Index(fields=['user2', 'created_at'], name='users_frie_user2_3d6a04_idx'),
        ),
        migrations.AddConstraint(
            model_name='friendship',
            constraint=models.UniqueConstraint(fields=('user1', 'user2'), name='unique_friendship_pair'),
        ),
        migrations.AddConstraint(
            model_name='friendship',
            constraint=models.CheckConstraint(condition=~Q(user1=models.F('user2')), name='prevent_self_friendship'),
        ),
    ]
