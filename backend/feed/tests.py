from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from .models import Post


def _tiny_gif(name='test.gif'):
	return SimpleUploadedFile(
		name,
		(
			b'GIF89a\x01\x00\x01\x00\x80\x00\x00'
			b'\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00'
			b',\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
		),
		content_type='image/gif',
	)


class FeedApiTests(APITestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='test@example.com',
			password='password123',
			first_name='Test',
			last_name='User',
		)
		self.other_user = User.objects.create_user(
			email='other@example.com',
			password='password123',
			first_name='Other',
			last_name='User',
		)
		self.client.force_authenticate(user=self.user)

	def test_create_post_with_multiple_images_and_captions(self):
		url = '/api/feed/posts/'
		data = {
			'content': 'Hello with photos',
			'visibility': 'public',
			'images': [_tiny_gif('a.gif'), _tiny_gif('b.gif')],
			'image_captions': ['First', 'Second'],
		}

		res = self.client.post(url, data, format='multipart')
		self.assertEqual(res.status_code, 201)
		self.assertIn('images', res.data)
		self.assertEqual(len(res.data['images']), 2)
		self.assertEqual(res.data['images'][0]['caption'], 'First')
		self.assertEqual(res.data['images'][1]['caption'], 'Second')
		self.assertTrue(res.data['images'][0]['image'])

	def test_private_post_can_be_liked_by_author_only(self):
		post = Post.objects.create(author=self.user, content='Private', visibility='private')
		url = f'/api/feed/posts/{post.id}/like/'
		res = self.client.post(url)
		self.assertIn(res.status_code, (200, 201))

		self.client.force_authenticate(user=self.other_user)
		res = self.client.post(url)
		self.assertEqual(res.status_code, 404)

	def test_public_post_likers_endpoint(self):
		post = Post.objects.create(author=self.user, content='Public', visibility='public')
		like_url = f'/api/feed/posts/{post.id}/like/'
		res = self.client.post(like_url)
		self.assertIn(res.status_code, (200, 201))

		likers_url = f'/api/feed/posts/{post.id}/likers/'
		res = self.client.get(likers_url)
		self.assertEqual(res.status_code, 200)
		self.assertTrue(any(u['id'] == self.user.id for u in res.data))

	def test_author_can_delete_post(self):
		post = Post.objects.create(author=self.user, content='To delete', visibility='public')
		url = f'/api/feed/posts/{post.id}/'
		res = self.client.delete(url)
		self.assertEqual(res.status_code, 204)
		self.assertFalse(Post.objects.filter(id=post.id).exists())

	def test_non_author_cannot_delete_post(self):
		post = Post.objects.create(author=self.user, content='Not yours', visibility='public')
		url = f'/api/feed/posts/{post.id}/'
		self.client.force_authenticate(user=self.other_user)
		res = self.client.delete(url)
		self.assertEqual(res.status_code, 403)
		self.assertTrue(Post.objects.filter(id=post.id).exists())
