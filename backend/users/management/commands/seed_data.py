from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from feed.models import Post, Comment
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with realistic demo users, posts, and comments'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to seed demo data...")

        # 1. Create Demo Users
        users_data = [
            {
                'email': 'steve@apple.com',
                'first_name': 'Steve',
                'last_name': 'Jobs',
                'role': 'CEO of Apple',
                'bio': 'Design is not just what it looks like and feels like. Design is how it works.',
            },
            {
                'email': 'ryan@linkedin.com',
                'first_name': 'Ryan',
                'last_name': 'Roslansky',
                'role': 'CEO of LinkedIn',
                'bio': 'Connecting the worlds professionals to make them more productive and successful.',
            },
            {
                'email': 'dylan@figma.com',
                'first_name': 'Dylan',
                'last_name': 'Field',
                'role': 'CEO of Figma',
                'bio': 'Empowering teams to create, test, and ship better designs from start to finish.',
            },
            {
                'email': 'radovan@trophy.com',
                'first_name': 'Radovan',
                'last_name': 'SkillArena',
                'role': 'Founder & CEO at Trophy',
                'bio': 'Building the future of competitive programming and skill validation.',
            }
        ]

        created_users = []
        for u_data in users_data:
            user, created = User.objects.get_or_create(
                email=u_data['email'],
                defaults={
                    'first_name': u_data['first_name'],
                    'last_name': u_data['last_name'],
                    'role': u_data['role'],
                    'bio': u_data['bio'],
                }
            )
            if created:
                user.set_password('demo1234')
                user.save()
                self.stdout.write(f"Created user {user.email}")
            created_users.append(user)

        self.stdout.write("Users seeded successfully.")

        # 2. Create Posts
        posts_data = [
            {
                'author': created_users[0], 
                'content': "Innovation distinguishes between a leader and a follower. What are you building today?",
                'visibility': 'public'
            },
            {
                'author': created_users[1],
                'content': "Reflecting on the importance of building a strong professional network. Relationships matter more than ever.",
                'visibility': 'public'
            },
            {
                'author': created_users[2], 
                'content': "Just shipped a huge update to our design system components! Excited to see how the community utilizes the new auto-layout features.",
                'visibility': 'public'
            },
            {
                'author': created_users[3], 
                'content': "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. Testing our new platform features today!",
                'visibility': 'public'
            }
        ]

        created_posts = []
        for p_data in posts_data:
            post = Post.objects.create(
                author=p_data['author'],
                content=p_data['content'],
                visibility=p_data['visibility']
            )
            created_posts.append(post)
            self.stdout.write(f"Created post for {post.author.first_name}")

        # 3. Create Comments
        comments_data = [
            {'post': created_posts[0], 'author': created_users[2], 'content': 'Absolutely! Good design is paramount.'},
            {'post': created_posts[0], 'author': created_users[1], 'content': 'Agreed.'},
            {'post': created_posts[2], 'author': created_users[0], 'content': 'Looks very clean. Great job team.'},
            {'post': created_posts[3], 'author': created_users[0], 'content': 'Keep up the momentum!'},
            {'post': created_posts[1], 'author': created_users[3], 'content': 'Network is net worth, as they say!'},
        ]

        for c_data in comments_data:
            Comment.objects.create(
                post=c_data['post'],
                author=c_data['author'],
                content=c_data['content']
            )
        
        self.stdout.write("Posts and comments seeded successfully.")

        self.stdout.write(self.style.SUCCESS("Database successfully seeded with Demo Data!"))
