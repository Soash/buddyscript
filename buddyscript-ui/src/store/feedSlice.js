import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import api from '../api/axios';

export const setCreatePostUploadProgress = createAction('feed/setCreatePostUploadProgress');

export const fetchPosts = createAsyncThunk('feed/fetchPosts', async (arg, { rejectWithValue }) => {
    try {
        // Backward compatible:
        // - dispatch(fetchPosts())
        // - dispatch(fetchPosts(authorId))
        // - dispatch(fetchPosts({ authorId, q, page }))
        let authorId;
        let q;
        let page;

        if (arg && typeof arg === 'object') {
            authorId = arg.authorId;
            q = arg.q;
            page = arg.page;
        } else {
            authorId = arg;
        }

        const params = new URLSearchParams();
        if (authorId) params.set('author', authorId);
        if (q) params.set('q', q);
        if (page) params.set('page', String(page));

        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`feed/posts/${query}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const createPost = createAsyncThunk('feed/createPost', async (postData, { rejectWithValue, dispatch }) => {
    try {
        const hasImages = Array.isArray(postData?.images) && postData.images.length > 0;

        let response;
        if (hasImages) {
            const formData = new FormData();
            formData.append('content', postData.content || '');
            formData.append('visibility', postData.visibility || 'public');

            postData.images.forEach((file) => {
                formData.append('images', file);
            });

            const captions = Array.isArray(postData.imageCaptions) ? postData.imageCaptions : [];
            captions.forEach((caption) => {
                formData.append('image_captions', caption || '');
            });

            response = await api.post('feed/posts/', formData, {
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent?.total;
                    const loaded = progressEvent?.loaded;
                    if (typeof loaded !== 'number' || loaded < 0) return;

                    // Some browsers / environments don't provide a computable total.
                    // In that case, show an indeterminate progress bar.
                    if (typeof total !== 'number' || total <= 0) {
                        dispatch(setCreatePostUploadProgress(null));
                        return;
                    }

                    const percent = Math.max(0, Math.min(100, Math.round((loaded * 100) / total)));
                    dispatch(setCreatePostUploadProgress(percent));
                },
            });
        } else {
            response = await api.post('feed/posts/', {
                content: postData?.content || '',
                visibility: postData?.visibility || 'public',
            });
        }
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const fetchPostLikers = createAsyncThunk('feed/fetchPostLikers', async (postId, { rejectWithValue }) => {
    try {
        const response = await api.get(`feed/posts/${postId}/likers/`);
        return { postId, likers: response.data };
    } catch (error) {
        return rejectWithValue({ postId, error: error.response?.data || error.message });
    }
});

export const fetchPostReactors = createAsyncThunk('feed/fetchPostReactors', async (postId, { rejectWithValue }) => {
    try {
        const response = await api.get(`feed/posts/${postId}/reactors/`);
        return { postId, reactors: response.data };
    } catch (error) {
        return rejectWithValue({ postId, error: error.response?.data || error.message });
    }
});

export const fetchCommentReactors = createAsyncThunk('feed/fetchCommentReactors', async (commentId, { rejectWithValue }) => {
    try {
        const response = await api.get(`feed/comments/${commentId}/reactors/`);
        return { commentId, reactors: response.data };
    } catch (error) {
        return rejectWithValue({ commentId, error: error.response?.data || error.message });
    }
});

export const togglePostReaction = createAsyncThunk('feed/togglePostReaction', async ({ postId, type }, { rejectWithValue }) => {
    try {
        const response = await api.post(`feed/posts/${postId}/like/`, { type });
        return { postId, ...response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const toggleLike = createAsyncThunk('feed/toggleLike', async (postId, { rejectWithValue }) => {
    try {
        const response = await api.post(`feed/posts/${postId}/like/`, { type: 'like' });
        return { postId, ...response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const deletePost = createAsyncThunk('feed/deletePost', async (postId, { rejectWithValue }) => {
    try {
        await api.delete(`feed/posts/${postId}/`);
        return { postId };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updatePost = createAsyncThunk('feed/updatePost', async ({ postId, content, visibility, deleteImageIds, existingCaptionsById, newImages, newImageCaptions, clearLegacyImage }, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        if (content !== undefined) formData.append('content', content);
        if (visibility !== undefined) formData.append('visibility', visibility);

        const ids = Array.isArray(deleteImageIds) ? deleteImageIds : [];
        ids.forEach((id) => {
            if (id !== null && id !== undefined) formData.append('images_to_delete', String(id));
        });

        if (existingCaptionsById && typeof existingCaptionsById === 'object') {
            formData.append('existing_image_captions', JSON.stringify(existingCaptionsById));
        }

        if (clearLegacyImage) {
            formData.append('clear_legacy_image', '1');
        }

        const files = Array.isArray(newImages) ? newImages : [];
        const captions = Array.isArray(newImageCaptions) ? newImageCaptions : [];
        files.forEach((file, idx) => {
            formData.append('images', file);
            formData.append('image_captions', captions[idx] || '');
        });

        const response = await api.patch(`feed/posts/${postId}/`, formData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const addComment = createAsyncThunk('feed/addComment', async ({ postId, text }, { rejectWithValue }) => {
    try {
        const response = await api.post(`feed/comments/`, { post: postId, content: text });
        return { postId, comment: response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const addReply = createAsyncThunk('feed/addReply', async ({ postId, parentId, text }, { rejectWithValue }) => {
    try {
        const response = await api.post(`feed/comments/`, { post: postId, parent: parentId, content: text });
        return { postId, comment: response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const toggleCommentLike = createAsyncThunk('feed/toggleCommentLike', async (commentId, { rejectWithValue }) => {
    try {
        const response = await api.post(`feed/comments/${commentId}/like/`, { type: 'like' });
        return { commentId, ...response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const toggleCommentReaction = createAsyncThunk('feed/toggleCommentReaction', async ({ commentId, type }, { rejectWithValue }) => {
    try {
        const response = await api.post(`feed/comments/${commentId}/like/`, { type });
        return { commentId, ...response.data };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const updateCommentInPost = (post, commentId, updater) => {
    if (!post?.comments) return false;

    const stack = Array.isArray(post.comments) ? [...post.comments] : [];
    while (stack.length > 0) {
        const comment = stack.shift();
        if (!comment) continue;

        if (comment.id === commentId) {
            updater(comment);
            return true;
        }
    }

    return false;
};

const feedSlice = createSlice({
    name: 'feed',
    initialState: {
        posts: [],
        loadingInitial: false,
        loadingMore: false,
        error: null,
        createPostUploading: false,
        createPostUploadProgress: null,
        page: 1,
        hasMore: true,
        next: null,
        count: null,
        likersByPostId: {},
        likersLoadingByPostId: {},
        reactorsByPostId: {},
        reactorsLoadingByPostId: {},
        reactorsByCommentId: {},
        reactorsLoadingByCommentId: {},
    },
    reducers: {},
    extraReducers: (builder) => {
        const applyPostReactionUpdate = (state, payload) => {
            const post = state.posts.find(p => p.id === payload.postId);
            if (!post) return;

            if (typeof payload.likes_count === 'number') {
                post.likes_count = payload.likes_count;
            } else if (payload.status === 'liked') {
                post.likes_count = (post.likes_count || 0) + 1;
            } else if (payload.status === 'unliked') {
                post.likes_count = Math.max(0, (post.likes_count || 0) - 1);
            }

            post.user_reaction_type = payload.reaction_type ?? null;
            post.is_liked_by_user = !!payload.reaction_type;

            if (Array.isArray(payload.latest_reactors)) {
                post.latest_reactors = payload.latest_reactors;
            }
        };

        builder
            .addCase(setCreatePostUploadProgress, (state, action) => {
                state.createPostUploadProgress = action.payload;
            })
            .addCase(fetchPosts.pending, (state, action) => {
                const requestedPage = action.meta?.arg && typeof action.meta.arg === 'object'
                    ? (action.meta.arg.page || 1)
                    : 1;

                if (requestedPage > 1) {
                    state.loadingMore = true;
                } else {
                    state.loadingInitial = true;
                }
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loadingInitial = false;
                state.loadingMore = false;

                const requestedPage = action.meta?.arg && typeof action.meta.arg === 'object'
                    ? (action.meta.arg.page || 1)
                    : 1;

                // Accommodates unpaginated or paginated DRF ModelViewSet structures
                if (Array.isArray(action.payload)) {
                    state.posts = action.payload;
                    state.page = 1;
                    state.count = action.payload.length;
                    state.next = null;
                    state.hasMore = false;
                    return;
                }

                const results = action.payload?.results || [];
                state.count = typeof action.payload?.count === 'number' ? action.payload.count : null;
                state.next = action.payload?.next || null;
                state.hasMore = !!action.payload?.next;

                if (requestedPage > 1) {
                    const existingIds = new Set(state.posts.map((p) => p.id));
                    for (const post of results) {
                        if (!existingIds.has(post.id)) state.posts.push(post);
                    }
                    state.page = requestedPage;
                } else {
                    state.posts = results;
                    state.page = 1;
                }
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loadingInitial = false;
                state.loadingMore = false;
                state.error = action.payload;
            })
            .addCase(createPost.pending, (state, action) => {
                const hasImages = Array.isArray(action.meta?.arg?.images) && action.meta.arg.images.length > 0;
                state.createPostUploading = hasImages;
                state.createPostUploadProgress = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
                state.createPostUploading = false;
                state.createPostUploadProgress = null;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.createPostUploading = false;
                state.createPostUploadProgress = null;
            })
            .addCase(toggleLike.fulfilled, (state, action) => {
                applyPostReactionUpdate(state, action.payload);
            })
            .addCase(togglePostReaction.fulfilled, (state, action) => {
                applyPostReactionUpdate(state, action.payload);
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload.postId);
                if (post) {
                    if (!post.comments) post.comments = [];
                    post.comments.unshift(action.payload.comment);
                    post.comments_count += 1;
                }
            })
            .addCase(addReply.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload.postId);
                if (post) {
                    if (!post.comments) post.comments = [];
                    post.comments.unshift(action.payload.comment);
                    post.comments_count += 1;
                }
            })
            .addCase(toggleCommentLike.fulfilled, (state, action) => {
                const { commentId, status } = action.payload;

                for (const post of state.posts) {
                    const updated = updateCommentInPost(post, commentId, (comment) => {
                        if (status === 'liked') {
                            comment.likes_count = (comment.likes_count || 0) + 1;
                            comment.is_liked_by_user = true;
                            comment.user_reaction_type = action.payload.reaction_type || 'like';
                        } else {
                            comment.likes_count = Math.max(0, (comment.likes_count || 0) - 1);
                            comment.is_liked_by_user = false;
                            comment.user_reaction_type = null;
                        }
                    });

                    if (updated) break;
                }
            })
            .addCase(toggleCommentReaction.fulfilled, (state, action) => {
                const { commentId } = action.payload;

                for (const post of state.posts) {
                    const updated = updateCommentInPost(post, commentId, (comment) => {
                        if (typeof action.payload.likes_count === 'number') {
                            comment.likes_count = action.payload.likes_count;
                        }
                        comment.user_reaction_type = action.payload.reaction_type ?? null;
                        comment.is_liked_by_user = !!action.payload.reaction_type;
                    });

                    if (updated) break;
                }
            })
            .addCase(fetchPostLikers.pending, (state, action) => {
                const postId = action.meta.arg;
                state.likersLoadingByPostId[postId] = true;
            })
            .addCase(fetchPostLikers.fulfilled, (state, action) => {
                state.likersLoadingByPostId[action.payload.postId] = false;
                state.likersByPostId[action.payload.postId] = action.payload.likers;
            })
            .addCase(fetchPostLikers.rejected, (state, action) => {
                const postId = action.payload?.postId ?? action.meta.arg;
                state.likersLoadingByPostId[postId] = false;
            });

        builder
            .addCase(fetchPostReactors.pending, (state, action) => {
                const postId = action.meta.arg;
                state.reactorsLoadingByPostId[postId] = true;
            })
            .addCase(fetchPostReactors.fulfilled, (state, action) => {
                state.reactorsLoadingByPostId[action.payload.postId] = false;
                state.reactorsByPostId[action.payload.postId] = action.payload.reactors;
            })
            .addCase(fetchPostReactors.rejected, (state, action) => {
                const postId = action.payload?.postId ?? action.meta.arg;
                state.reactorsLoadingByPostId[postId] = false;
            })
            .addCase(fetchCommentReactors.pending, (state, action) => {
                const commentId = action.meta.arg;
                state.reactorsLoadingByCommentId[commentId] = true;
            })
            .addCase(fetchCommentReactors.fulfilled, (state, action) => {
                state.reactorsLoadingByCommentId[action.payload.commentId] = false;
                state.reactorsByCommentId[action.payload.commentId] = action.payload.reactors;
            })
            .addCase(fetchCommentReactors.rejected, (state, action) => {
                const commentId = action.payload?.commentId ?? action.meta.arg;
                state.reactorsLoadingByCommentId[commentId] = false;
            });

        builder.addCase(deletePost.fulfilled, (state, action) => {
            const postId = action.payload.postId;
            state.posts = state.posts.filter((p) => p.id !== postId);
            delete state.likersByPostId[postId];
            delete state.likersLoadingByPostId[postId];
            delete state.reactorsByPostId[postId];
            delete state.reactorsLoadingByPostId[postId];
        });

        builder.addCase(updatePost.fulfilled, (state, action) => {
            const updated = action.payload;
            if (!updated?.id) return;
            const idx = state.posts.findIndex((p) => p.id === updated.id);
            if (idx !== -1) {
                state.posts[idx] = updated;
            }
        });
    }
});

export default feedSlice.reducer;
