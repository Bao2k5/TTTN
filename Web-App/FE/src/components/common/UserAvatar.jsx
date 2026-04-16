
import { useState } from 'react';

const UserAvatar = ({ user, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const getInitial = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  const getAvatarColor = () => {

    if (!user || !user.name) return '#A89678';
    const colors = ['#5C4033', '#A89678', '#D9CCBE', '#E8DFD3', '#C0C0C0'];
    const index = user.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {

      const formData = new FormData();
      formData.append('avatar', file);

      if (onUpload) {
        await onUpload(formData);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (user?.avatar?.url) {
    return (
      <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-accent-silver cursor-pointer hover:shadow-md transition-all">
        <img
          src={user.avatar.url}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        <label className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <span className="text-white text-xs">📷</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-accent-silver cursor-pointer hover:shadow-md transition-all font-serif font-bold text-white text-sm md:text-base hover:scale-105"
        style={{ backgroundColor: getAvatarColor() }}
        title={user?.name || 'User'}
      >
        {getInitial()}
      </div>
      <label className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
        <span className="text-white text-xs">📷</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default UserAvatar;
