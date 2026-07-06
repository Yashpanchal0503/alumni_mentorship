import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Search, Heart, MessageSquare, PlusCircle, ArrowLeft, RefreshCw, Tag, Trash2 } from 'lucide-react';

// Inline SVG default avatar
const DefaultAvatar: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#e2e8f0" />
    <circle cx="20" cy="14" r="7" fill="#94a3b8" />
    <ellipse cx="20" cy="33" rx="12" ry="9" fill="#94a3b8" />
  </svg>
);

interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
    photo?: string;
    mentorProfile?: { photo: string; designation: string };
  };
}

interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: {
    id?: number;
    name: string;
    role: string;
    photo?: string;
    mentorProfile?: { photo: string; designation: string; company: string };
  };
  comments: { id: number }[];
}

export const Forum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [search, setSearch] = useState('');

  // Modal states for creating posts
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Career');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categories = ['All Topics', 'Career', 'Placements', 'Resume', 'Higher Studies', 'Internship', 'Startups', 'Coding', 'General'];

  const getAvatarSrc = (u?: { photo?: string; mentorProfile?: { photo: string } } | null): string | null => {
    return u?.photo || u?.mentorProfile?.photo || null;
  };

  // Fetch posts list
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      if (activeCategory !== 'All Topics') qParams.append('category', activeCategory);
      if (sortBy) qParams.append('sort', sortBy);
      if (search) qParams.append('search', search);

      const data = await apiRequest(`/posts?${qParams.toString()}`);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, sortBy, search]);

  // Fetch single post if ID is present
  useEffect(() => {
    if (id) {
      const fetchSinglePost = async () => {
        try {
          const data = await apiRequest(`/posts/${id}`);
          setActivePost(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSinglePost();
    } else {
      setActivePost(null);
    }
  }, [id]);

  const handleLike = async (postId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = await apiRequest(`/posts/${postId}/like`, { method: 'POST' });
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      if (activePost && activePost.id === postId) {
        setActivePost({ ...activePost, likes: data.likes });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: number) => {
    setDeleteLoading(true);
    try {
      await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      if (id) {
        // On detail view, go back to forum list after deletion
        navigate('/forum');
      } else {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    try {
      const tagArray = newTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          tags: tagArray
        })
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activePost) return;

    setCommentSubmitLoading(true);
    try {
      const commentData = await apiRequest('/comments', {
        method: 'POST',
        body: JSON.stringify({
          postId: activePost.id,
          content: newComment
        })
      });

      const updatedComments = activePost.comments ? [...(activePost.comments as any), {
        ...commentData,
        user: { name: user?.name, role: user?.role, photo: user?.photo, mentorProfile: user?.mentorProfile }
      }] : [commentData];

      setActivePost({ ...activePost, comments: updatedComments });
      setNewComment('');
      setPosts(posts.map(p => p.id === activePost.id ? { ...p, comments: [...p.comments, { id: commentData.id }] } : p));
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'MENTOR') {
      return (
        <span className="bg-teal-100 text-[9px] font-bold text-brand px-2 py-0.5 rounded-md uppercase tracking-wider">
          ALUMNI EXPERT
        </span>
      );
    }
    if (role === 'ADMIN') {
      return (
        <span className="bg-blue-100 text-[9px] font-bold text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
          ADMIN
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-[9px] font-bold text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
        STUDENT
      </span>
    );
  };

  // Can user delete a given post?
  const canDelete = (post: Post) => {
    if (!user) return false;
    return user.role === 'ADMIN' || (user as any).id === post.userId;
  };

  // Render Discussion detail view
  if (id && activePost) {
    const commentsList = (activePost as any).comments || [];
    const tags = JSON.parse(activePost.tags || '[]');
    const postAvatar = getAvatarSrc(activePost.user);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center space-x-2 text-slate-500 hover:text-brand font-semibold text-xs mb-6 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Discussions</span>
        </button>

        {/* Thread Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {postAvatar ? (
                <img
                  src={postAvatar}
                  alt={activePost.user.name}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                />
              ) : (
                <DefaultAvatar className="h-12 w-12 rounded-xl" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-sm">{activePost.user.name}</span>
                  {getRoleBadge(activePost.user.role)}
                </div>
                <span className="text-[10px] text-slate-400">
                  Posted {new Date(activePost.createdAt).toLocaleDateString()} in {activePost.category}
                </span>
              </div>
            </div>

            {/* Delete button on detail view */}
            {canDelete(activePost) && (
              <button
                onClick={() => setDeleteConfirmId(activePost.id)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Post</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
              {activePost.title}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {activePost.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pb-2">
            {tags.map((t: string) => (
              <span key={t} className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2.5 py-1 rounded-md flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>{t}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <button
              onClick={(e) => handleLike(activePost.id, e)}
              className="flex items-center space-x-1.5 text-red-500 hover:text-red-600 transition-colors"
            >
              <Heart className="h-4 w-4 fill-current" />
              <span>{activePost.likes} Likes</span>
            </button>
            <span className="flex items-center space-x-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>{commentsList.length} Comments</span>
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-slate-800 text-sm uppercase">Discussion Replies</h3>

          <div className="space-y-4">
            {commentsList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                Be the first to reply to this discussion!
              </div>
            ) : (
              commentsList.map((c: Comment) => {
                const commentAvatar = getAvatarSrc(c.user);
                return (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center space-x-3">
                      {commentAvatar ? (
                        <img
                          src={commentAvatar}
                          alt={c.user.name}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <DefaultAvatar className="h-9 w-9 rounded-lg" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-xs">{c.user.name}</span>
                          {getRoleBadge(c.user.role)}
                        </div>
                        <span className="text-[9px] text-slate-400">
                          Replied on {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed pl-12">{c.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleAddComment} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase">Join the Conversation</h4>
            <textarea
              required
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Provide context or support resources for this discussion..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commentSubmitLoading}
                className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md active-scale disabled:opacity-50"
              >
                {commentSubmitLoading ? 'Submitting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
            Please{' '}
            <Link to="/login" className="text-brand font-bold hover:underline">
              Sign In
            </Link>{' '}
            to reply to this thread.
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center space-y-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Delete this post?</h3>
              <p className="text-sm text-slate-500">This will permanently delete the post and all its comments. This action cannot be undone.</p>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="border border-slate-200 px-5 py-2.5 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePost(deleteConfirmId)}
                  disabled={deleteLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main forum feed lists
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Forum Header with Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Discussion Forum</h1>
          <p className="text-slate-500 text-sm mt-1">
            Exchange advice, share interview experiences, and discuss higher studies roadmaps.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search forum topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <button
            onClick={() => {
              if (!user) navigate('/login');
              else setShowCreateModal(true);
            }}
            className="bg-brand hover:bg-brand-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-colors shadow-md active-scale"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category List Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3">CATEGORIES</h3>
            <div className="space-y-1">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeCategory === c
                      ? 'bg-teal-50 text-brand'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span>{c}</span>
                  {activeCategory === c && <div className="h-1.5 w-1.5 bg-brand rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Top Contributors Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase mb-4">Top Contributors</h3>
            <div className="space-y-3.5">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
                  alt="Sarah Jenkins"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Sarah Jenkins</h4>
                  <p className="text-[9px] text-slate-400">Product Strategy • Class of '14</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Marcus Chen"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">Marcus Chen</h4>
                  <p className="text-[9px] text-slate-400">Machine Learning • Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discussions Board Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Feed Toolbar */}
          <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500">
            {['Most Recent', 'Popular'].map(sortOpt => (
              <button
                key={sortOpt}
                onClick={() => setSortBy(sortOpt)}
                className={`py-3 px-4 -mb-[1px] border-b-2 transition-all ${
                  sortBy === sortOpt
                    ? 'border-brand text-brand font-extrabold'
                    : 'border-transparent hover:text-slate-800'
                }`}
              >
                {sortOpt}
              </button>
            ))}
          </div>

          {/* Loader or Feed List */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <RefreshCw className="h-8 w-8 text-brand animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
              No discussion threads in this category. Be the first to add a thread!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(p => {
                const tags = JSON.parse(p.tags || '[]');
                const postAv = getAvatarSrc(p.user);
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-brand-light transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Author header */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center space-x-3 cursor-pointer flex-1"
                          onClick={() => navigate(`/forum/${p.id}`)}
                        >
                          {postAv ? (
                            <img
                              src={postAv}
                              alt={p.user?.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <DefaultAvatar className="h-8 w-8 rounded-lg" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800 text-xs">{p.user?.name}</span>
                              {getRoleBadge(p.user?.role)}
                            </div>
                            <span className="text-[9px] text-slate-400">
                              Posted {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Delete button on list view (only for own posts or admin) */}
                        {canDelete(p) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Title & Body Preview */}
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/forum/${p.id}`)}
                      >
                        <h3 className="font-bold text-slate-800 text-base hover:text-brand transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mt-1.5">
                          {p.content}
                        </p>
                      </div>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1">
                        {tags.map((t: string) => (
                          <span
                            key={t}
                            className="bg-slate-50 text-[9px] font-semibold text-slate-500 px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom toolbar */}
                    <div
                      className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-500 cursor-pointer"
                      onClick={() => navigate(`/forum/${p.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => handleLike(p.id, e)}
                          className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-4 w-4 fill-current text-red-100 hover:text-red-500" />
                          <span>{p.likes}</span>
                        </button>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4 text-slate-400" />
                          <span>{p.comments.length} Comments</span>
                        </span>
                      </div>

                      <span className="text-brand hover:underline text-[11px] font-bold">
                        Read Thread &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Topic Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl overflow-hidden relative">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Create New Discussion Topic</h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tips on preparing for McKinsey case interviews"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  >
                    {categories.filter(c => c !== 'All Topics').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. interview, consulting, career"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description / Question</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Elaborate on your questions, expectations, or share experiences..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-slate-200 px-4 py-2 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md active-scale"
                >
                  Post Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal (on list view) */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center space-y-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Delete this post?</h3>
            <p className="text-sm text-slate-500">This will permanently delete the post and all its comments. This action cannot be undone.</p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="border border-slate-200 px-5 py-2.5 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmId)}
                disabled={deleteLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
