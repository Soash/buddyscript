from django.contrib import admin

from .models import Comment, CommentLike, Post, PostImage, PostLike


class PostImageInline(admin.TabularInline):
	model = PostImage
	extra = 0
	fields = ('image', 'caption', 'position', 'created_at')
	readonly_fields = ('created_at',)
	ordering = ('position', 'id')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
	list_display = (
		'id',
		'author',
		'visibility',
		'created_at',
		'likes_count',
		'comments_count',
	)
	list_filter = ('visibility', 'created_at')
	search_fields = ('author__email', 'author__first_name', 'author__last_name', 'content')
	autocomplete_fields = ('author',)
	ordering = ('-created_at',)
	date_hierarchy = 'created_at'
	inlines = [PostImageInline]
	list_select_related = ('author',)


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
	list_display = ('id', 'post', 'position', 'created_at')
	list_filter = ('created_at',)
	search_fields = ('post__id',)
	autocomplete_fields = ('post',)
	ordering = ('-created_at',)
	list_select_related = ('post',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
	list_display = ('id', 'post', 'author', 'parent', 'created_at', 'likes_count')
	list_filter = ('created_at',)
	search_fields = ('author__email', 'content', 'post__id')
	autocomplete_fields = ('post', 'author', 'parent')
	ordering = ('-created_at',)
	list_select_related = ('post', 'author', 'parent')


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'post', 'created_at')
	list_filter = ('created_at',)
	search_fields = ('user__email', 'post__id')
	autocomplete_fields = ('user', 'post')
	ordering = ('-created_at',)
	list_select_related = ('post', 'user')


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'comment', 'created_at')
	list_filter = ('created_at',)
	search_fields = ('user__email', 'comment__id')
	autocomplete_fields = ('user', 'comment')
	ordering = ('-created_at',)
	list_select_related = ('comment', 'user')
