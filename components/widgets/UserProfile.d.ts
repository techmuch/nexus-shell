import { default as React } from '../../../node_modules/react';

export interface UserProfileProps {
    name?: string;
    avatarUrl?: string;
    role?: string;
    email?: string;
    onClick?: () => void;
    className?: string;
    showName?: boolean;
}
export declare const UserProfile: React.FC<UserProfileProps>;
