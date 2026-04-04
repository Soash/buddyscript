from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Follow, FriendRequest, Friendship


class UsersSocialApiTests(APITestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(email='test@example.com', password='password123')
		self.other = User.objects.create_user(email='other@example.com', password='password123')
		self.third = User.objects.create_user(email='third@example.com', password='password123')
		self.client.force_authenticate(user=self.user)

	def test_follow_toggle_follow_then_unfollow(self):
		url = f'/api/users/follow/{self.other.id}/'

		res = self.client.post(url)
		self.assertEqual(res.status_code, 201)
		self.assertTrue(Follow.objects.filter(follower=self.user, following=self.other).exists())

		res = self.client.post(url)
		self.assertEqual(res.status_code, 200)
		self.assertFalse(Follow.objects.filter(follower=self.user, following=self.other).exists())

	def test_follow_self_rejected(self):
		url = f'/api/users/follow/{self.user.id}/'
		res = self.client.post(url)
		self.assertEqual(res.status_code, 400)

	def test_send_and_accept_friend_request(self):
		send_url = f'/api/users/friend-requests/send/{self.other.id}/'
		res = self.client.post(send_url)
		self.assertEqual(res.status_code, 201)
		fr_id = res.data['id']
		self.assertTrue(FriendRequest.objects.filter(id=fr_id).exists())

		self.client.force_authenticate(user=self.other)
		incoming_url = '/api/users/friend-requests/incoming/'
		res = self.client.get(incoming_url)
		self.assertEqual(res.status_code, 200)
		self.assertTrue(any(r['id'] == fr_id for r in res.data))

		accept_url = f'/api/users/friend-requests/{fr_id}/accept/'
		res = self.client.post(accept_url)
		self.assertEqual(res.status_code, 200)
		self.assertFalse(FriendRequest.objects.filter(id=fr_id).exists())
		self.assertTrue(Friendship.are_friends(self.user.id, self.other.id))

		# Now sending again should fail since already friends
		self.client.force_authenticate(user=self.user)
		res = self.client.post(send_url)
		self.assertEqual(res.status_code, 400)

	def test_cancel_sent_friend_request(self):
		send_url = f'/api/users/friend-requests/send/{self.other.id}/'
		res = self.client.post(send_url)
		self.assertEqual(res.status_code, 201)
		fr_id = res.data['id']
		self.assertTrue(FriendRequest.objects.filter(id=fr_id).exists())

		cancel_url = f'/api/users/friend-requests/{fr_id}/cancel/'
		res = self.client.post(cancel_url)
		self.assertEqual(res.status_code, 200)
		self.assertFalse(FriendRequest.objects.filter(id=fr_id).exists())

	def test_decline_incoming_friend_request(self):
		send_url = f'/api/users/friend-requests/send/{self.other.id}/'
		res = self.client.post(send_url)
		self.assertEqual(res.status_code, 201)
		fr_id = res.data['id']

		# Receiver declines
		self.client.force_authenticate(user=self.other)
		decline_url = f'/api/users/friend-requests/{fr_id}/decline/'
		res = self.client.post(decline_url)
		self.assertEqual(res.status_code, 200)
		self.assertFalse(FriendRequest.objects.filter(id=fr_id).exists())

	def test_suggested_excludes_me_friends_and_following(self):
		User = get_user_model()
		candidates = [
			User.objects.create_user(email='u1@example.com', password='password123'),
			User.objects.create_user(email='u2@example.com', password='password123'),
			User.objects.create_user(email='u3@example.com', password='password123'),
			User.objects.create_user(email='u4@example.com', password='password123'),
		]

		# Make `other` a friend and `third` a following
		Friendship.objects.create(user1=self.user, user2=self.other)
		Follow.objects.create(follower=self.user, following=self.third)
		FriendRequest.objects.create(sender=self.user, receiver=candidates[0])

		res = self.client.get('/api/users/suggested/')
		self.assertEqual(res.status_code, 200)
		result_ids = [u['id'] for u in res.data]

		self.assertNotIn(self.user.id, result_ids)
		self.assertNotIn(self.other.id, result_ids)
		self.assertNotIn(self.third.id, result_ids)
		self.assertNotIn(candidates[0].id, result_ids)

		candidate_ids = {u.id for u in candidates}
		self.assertTrue(set(result_ids).issubset(candidate_ids))

	def test_you_might_like_returns_unfollowed_user(self):
		User = get_user_model()
		candidate1 = User.objects.create_user(email='like1@example.com', password='password123')
		candidate2 = User.objects.create_user(email='like2@example.com', password='password123')

		# Follow candidate1 so it should not be returned.
		Follow.objects.create(follower=self.user, following=candidate1)

		res = self.client.get('/api/users/you-might-like/')
		self.assertEqual(res.status_code, 200)
		self.assertIsNotNone(res.data)
		self.assertNotEqual(res.data['id'], self.user.id)
		self.assertNotEqual(res.data['id'], candidate1.id)
		self.assertIn(res.data['id'], [candidate2.id, self.other.id, self.third.id])

	def test_you_might_like_exclude_id(self):
		User = get_user_model()
		only_candidate = User.objects.create_user(email='only@example.com', password='password123')
		other_candidate = User.objects.create_user(email='other2@example.com', password='password123')

		# Exclude all other built-in users from being eligible.
		Follow.objects.create(follower=self.user, following=self.other)
		Follow.objects.create(follower=self.user, following=self.third)
		Follow.objects.create(follower=self.user, following=other_candidate)

		# Now only_candidate is the only eligible person.
		res = self.client.get(f'/api/users/you-might-like/?exclude_id={only_candidate.id}')
		self.assertEqual(res.status_code, 200)
		self.assertIsNone(res.data)
