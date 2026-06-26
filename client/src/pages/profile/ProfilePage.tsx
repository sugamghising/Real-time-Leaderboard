import { useAuthStore } from "../../stores/authStore";
import { User, Mail, Calendar } from "lucide-react";

export const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Profile</h1>

      <div className="bg-surface rounded-md border border-border shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-6">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user?.username} avatar`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-on-surface">
                {user?.username}
              </h2>
              <p className="text-secondary">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#F5F0FF] text-tertiary text-sm font-medium rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4 md:p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            Account Information
          </h3>

          <div className="mb-4">
            <a
              href="/profile/edit"
              className="inline-block px-4 py-2 bg-accent text-white rounded-none hover:bg-[#7A16E0] dark:hover:bg-[#6B14CC]"
            >
              Edit Profile
            </a>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm text-secondary">Username</p>
                <p className="font-medium text-on-surface">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm text-secondary">Email</p>
                <p className="font-medium text-on-surface">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm text-secondary">Member Since</p>
                <p className="font-medium text-on-surface">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
