"use client";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { useState } from "react";
import { useUserDetails } from "./Hook/useProfileData";
import { PersonalInformationCard } from "./components/personal-information-card";
import { ProfileSummaryCard } from "./components/profile-summary-card";
import { SecurityCard } from "./components/security-card";
import Loader from "./loader";

const ProfileCard = () => {
  const isHeaderStuck = useHeaderStuck();
  const {
    loading,
    userData,
    initials,
    userFullName,
    loadingData,
    updateUserLoading,
    form,
    isEditing,
    onEdit,
    handleCancelEdit,
    onSubmit,
    loadingPassword,
    isEditPassword,
    passwordForm,
    passwordToggleState,
    handlePasswordShowHideToggle,
    submitPasswordUpdate,
    handleupdatePassword,
    handlePasswordCancel,
  } = useUserDetails();

  if (loadingData || (loading && !userData)) {
    return <Loader />;
  }

  // Check if userData is null or empty
  const isUserEmpty = !userData || Object.keys(userData).length === 0;
  return (
    <div className="py-6 flex flex-col gap-6">
      {/* --- Sticky Header --- */}
      <div
        className={`px-6 sticky top-0 bg-background z-10 transition-all duration-200 ${isHeaderStuck ? "border-b py-4 shadow-xs" : "pt-4"
          }`}
      >
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Profile
          </h2>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      {isUserEmpty ? (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500 text-lg font-medium">No profile found</p>
        </div>
      ) : (
        <div className="px-6 flex flex-col lg:flex-row lg:items-start gap-8">
          {/* ProfileSummary  */}
          <div className="flex justify-center lg:justify-start shrink-0">
            <ProfileSummaryCard
              userData={userData}
              initials={initials}
              userFullName={userFullName}
            />
          </div>

          {/* Cards container */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="max-w-6xl">
              <PersonalInformationCard
                user={userData}
                form={form}
                isEditing={isEditing}
                updateUserLoading={updateUserLoading}
                onEdit={onEdit}
                handleCancelEdit={handleCancelEdit}
                onSubmit={onSubmit}
              />
            </div>

            <div className="max-w-4xl">
              <SecurityCard
                loadingPassword={loadingPassword}
                isEditPassword={isEditPassword}
                passwordForm={passwordForm}
                passwordToggleState={passwordToggleState}
                handlePasswordShowHideToggle={handlePasswordShowHideToggle}
                submitPasswordUpdate={submitPasswordUpdate}
                handleupdatePassword={handleupdatePassword}
                handlePasswordCancel={handlePasswordCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileCard;
