import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchPosts } from '../store/feedSlice';
import CreatePostCard from '../components/CreatePostCard';
import PostCard from '../components/PostCard';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Navbar from '../components/Navbar';
import SwitchingBtn from '../components/SwitchingBtn';
import Story from '../components/Story';

const Feed = () => {
	
	// ✅ Add this instead:
	const [isDarkMode, setIsDarkMode] = useState(() => {
		// Check if the user previously saved a preference
		const savedMode = localStorage.getItem('darkMode');
		// If they saved 'true', turn on dark mode. Otherwise, default to false (light mode).
		return savedMode === 'true'; 
	});

	const dispatch = useDispatch();
	const { posts, loadingInitial, loadingMore, page, hasMore } = useSelector(state => state.feed);
	const location = useLocation();
	const searchQuery = (new URLSearchParams(location.search).get('q') || '').trim();
	const loadMoreRef = useRef(null);

	useEffect(() => {
		dispatch(fetchPosts({ q: searchQuery, page: 1 }));
	}, [dispatch, searchQuery]);

	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target) return;
		if (!hasMore) return;
		if (loadingInitial || loadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (!first?.isIntersecting) return;
				if (!hasMore) return;
				if (loadingInitial || loadingMore) return;
				dispatch(fetchPosts({ q: searchQuery, page: page + 1 }));
			},
			{ root: null, rootMargin: '200px', threshold: 0 }
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, [dispatch, searchQuery, page, hasMore, loadingInitial, loadingMore]);

	useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

	return (
		<React.Fragment>

			{/*Feed Section Start*/}
			<div className={`_layout _layout_main_wrapper ${isDarkMode ? "_dark_wrapper" : ""}`}>
				<SwitchingBtn onToggle={() => setIsDarkMode((prev) => !prev)} />




				<div className="_main_layout">

					<Navbar />

					{/* Main Layout Structure */}
					<div className="container _custom_container">
						<div className="_layout_inner_wrap">
							<div className="row">
								{/* Left Sidebar */}
								<LeftSidebar />
								{/* Left Sidebar */}

								{/* Layout Middle */}
								<div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
									<div className="_layout_middle_wrap">
										<div className="_layout_middle_inner">

											<Story />
											<CreatePostCard />
											{loadingInitial ? (
												<p>Loading posts...</p>
											) : posts.length === 0 ? (
												<p>No posts found.</p>
											) : (
												<>
													{posts.map((post) => (
														<PostCard key={post.id} post={post} />
													))}
													<div ref={loadMoreRef} style={{ height: 1 }} />
													{loadingMore ? <p>Loading more...</p> : null}
													{!hasMore && posts.length > 0 ? <p>No more posts.</p> : null}
												</>
											)}
										</div>
									</div>
								</div>
								{/* Layout Middle */}

								{/* Right Sidebar */}
								<RightSidebar />
								{/* Right Sidebar */}
							</div>
						</div>
					</div>
					{/* Main Layout Structure */}

				</div>

			</div>
			{/*Feed Section End*/}






		</React.Fragment>
	);
};

export default Feed;
