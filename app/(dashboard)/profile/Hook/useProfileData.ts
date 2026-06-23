import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  passwordUpdateSchema,
  passwordUpdateSchemaType,
  profileformSchema,
  ProfileFormSchemaType,
} from "@/lib/schemas/profile-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useUserDetails = () => {
  const { data: session } = useSession();
  const { axiosAuth, loading } = useAxiosAuth();
  const [userData, setUserData] = useState<any>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updateUserLoading, setUpdateUserLoading] = useState<boolean>(false);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isEditPassword, setIsEditPassword] = useState(false);

  const [passwordToggleState, setPasswordToggleState] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordShowHideToggle = (fieldName: string) => {
    setPasswordToggleState((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName as keyof typeof prev], // type-safe access
    }));
  };

  const fetchUserDetails = async () => {
    if (!loading) {
      try {
        setLoadingData(true);
        const result = await axiosAuth.get(`${url.USER_DETAILS}`);
        if (result?.status === 200) {
          const userInfo = result?.data;
          setUserData(userInfo || {});
          setLoadingData(false);

          const first = userInfo?.first_name;
          const last = userInfo?.last_name;

          if (first && last) {
            const contactInitials =
              first.charAt(0).toUpperCase() + last.charAt(0).toUpperCase();
            setInitials(contactInitials);
            setUserFullName(`${first} ${last}`);
          } else if (userInfo?.email) {
            const contactInitials = userInfo.email.charAt(0).toUpperCase();
            setInitials(contactInitials);
          }
        }
      } catch (err) {
        setLoadingData(false);

        console.error(err);
        errorMessageHandler(err);
      }
    }
  };

  const form = useForm<ProfileFormSchemaType>({
    resolver: zodResolver(profileformSchema),
    defaultValues: {
      first_name: userData?.first_name || "",
      last_name: userData?.last_name || "",
    },
    mode: "onChange",
  });

  const onEdit = () => {
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset();
  };

  const onSubmit = async (values: ProfileFormSchemaType) => {
    if (!loading) {
      if (values["first_name"] !== "" || values["last_name"] !== "") {
        let dataModal: any = {};
        dataModal["first_name"] = values["first_name"];
        dataModal["last_name"] = values["last_name"];
        dataModal["user_id"] = session?.user?.id;

        try {
          setUpdateUserLoading(true);
          const API_ENDPOINT_PATH = `${url.USER_PROFILE_EDIT}`;
          const result = await axiosAuth.patch(API_ENDPOINT_PATH, dataModal);

          if (result?.status === 200) {
            fetchUserDetails();
            successMessageHandler("Profile updated successfully");
            setIsEditing(false);
            form.reset();
          } else {
            errorMessageHandler("Failed to update profile");
          }
        } catch (error) {
          errorMessageHandler("An error occurred while updating the profile");
        } finally {
          setUpdateUserLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (userData) {
      form.reset({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const passwordForm = useForm<passwordUpdateSchemaType>({
    resolver: zodResolver(passwordUpdateSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirm_password: "",
      current_password: "",
    },
  });

  const submitPasswordUpdate = async (values: passwordUpdateSchemaType) => {
    if (!loading) {
      const payload = {
        new_password: values.confirm_password,
        current_password: values.current_password,
      };

      try {
        setLoadingPassword(true);
        const res = await axiosAuth.put(
          url.USER_PROFILE_UPDATE_PASSWORD,
          payload
        );
        if (res?.status === 200) {
          successMessageHandler(res.data.message);
          setLoadingPassword(false);
          setIsEditPassword(false);
          passwordForm.reset();
        }
      } catch (error: any) {
        console.error(error);
        setLoadingPassword(false);
        errorMessageHandler(error);
      }
    }
  };

  const handleupdatePassword = () => {
    setIsEditPassword((prev) => !prev);
  };
  const handlePasswordCancel = () => {
    setIsEditPassword(false);
    passwordForm.reset();
  };

  //   get user details when session is available
  useEffect(() => {
    if (session?.user?.id !== undefined) {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
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
  };
};
