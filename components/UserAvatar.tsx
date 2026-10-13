
"use client";

import Image from "next/image";
import { useState } from "react";

type UserAvatarProps = {
  image?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  fallback?: string;
};

const UserAvatar = ({ image, name, size = 40, className = "", fallbackClassName = "text-xl font-bold text-white", fallback = "U" }: UserAvatarProps) => {
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const showImage = Boolean(image && failedImage !== image);
  const initial = name?.trim().charAt(0).toUpperCase() || fallback;

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      {showImage && image ? (
        <Image src={image} alt="User profile" fill sizes={`${size}px`} className="object-cover" onError={() => setFailedImage(image)} />
      ) : (
        <span className={fallbackClassName}>{initial}</span>
      )}
    </div>
  );
};

export default UserAvatar;
