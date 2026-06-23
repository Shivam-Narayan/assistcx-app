"use client";

import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { setColorTheme } from "@/redux/app-theme/theme-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function useSyncConfigurationTheme() {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();

  useEffect(() => {
    if (loading) return;
    axiosAuth
      .get(url.GET_CONFIGURATION)
      .then((result) => {
        if (result?.status === 200) {
          dispatch(setColorTheme(result.data.preferences.theme));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
}
