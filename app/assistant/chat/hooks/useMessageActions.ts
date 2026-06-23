import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCopyToClipboard } from "@/helper/helper-function";
import { useAppSelector } from "@/redux/store";
import { CHAT_FEEDBACK } from "@/lib/assistant-urls";
import {
  ChatMessage,
  FeedbackPayload,
  UseMessageActionsReturn,
} from "../_components/types";

export function useMessageActions(
  message: ChatMessage,
): UseMessageActionsReturn {
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const handleCopy = () => {
    if (message.role === "assistant") {
      copyToClipboard(message.answer || "");
      toast.success("Message copied to clipboard");
    }
  };
  const [sentiment, setSentiment] = useState(message?.feedback?.sentiment);
  const [categories, setCategories] = useState<string[]>(
    message?.feedback?.category || [],
  );
  const [comment, setComment] = useState(message?.feedback?.comment || "");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showTokenUsageSheet, setShowTokenUsageSheet] = useState(false);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isRootUser = permissions?.isRoot ?? false;

  const { axiosAuth } = useAxiosAuth();

  // Sync feedback state when message changes
  useEffect(() => {
    if (message?.feedback) {
      setSentiment(message.feedback.sentiment);
      setCategories(message.feedback.category || []);
      setComment(message.feedback.comment || "");
    }
  }, [message?.message_id, message?.feedback]);

  const submitFeedback = async (feedback: FeedbackPayload) => {
    try {
      await axiosAuth.patch(`${CHAT_FEEDBACK}/${message?.message_id}`, {
        feedback: {
          sentiment: feedback.sentiment,
          category: feedback.category || [],
          comment: feedback.comment,
        },
      });
    } catch {
      toast.error("Error submitting feedback");
    }
  };

  const handleLike = () => {
    const newSentiment = sentiment === "POSITIVE" ? "" : "POSITIVE";
    let updatedCategories = [...categories];

    if (newSentiment === "POSITIVE") {
      if (!updatedCategories.includes("helpful"))
        updatedCategories.push("helpful");
      updatedCategories = updatedCategories.filter(
        (cat) => cat !== "not-helpful",
      );
    } else {
      updatedCategories = updatedCategories.filter((cat) => cat !== "helpful");
    }

    setSentiment(newSentiment);
    setCategories(updatedCategories);
    submitFeedback({
      sentiment: newSentiment,
      comment,
      category: updatedCategories,
    });
    toast.success(newSentiment ? "Message liked" : "Removed like");
  };

  const handleDislike = () => {
    const newSentiment = sentiment === "NEGATIVE" ? "" : "NEGATIVE";
    let updatedCategories = [...categories];

    if (newSentiment === "NEGATIVE") {
      if (!updatedCategories.includes("not-helpful"))
        updatedCategories.push("not-helpful");
      updatedCategories = updatedCategories.filter((cat) => cat !== "helpful");
    } else {
      updatedCategories = updatedCategories.filter(
        (cat) => cat !== "not-helpful",
      );
    }

    setSentiment(newSentiment);
    setCategories(updatedCategories);
    submitFeedback({
      sentiment: newSentiment,
      comment,
      category: updatedCategories,
    });
    toast.success(newSentiment ? "Message disliked" : "Removed dislike");
  };

  const handleFeedbackSubmit = (data: {
    category: string[];
    comment: string;
    sentiment: string;
  }) => {
    const updatedSentiment = "NEGATIVE";
    const filteredCategories = data.category.filter((c) => c !== "helpful");

    if (!filteredCategories.includes("not-helpful")) {
      filteredCategories.push("not-helpful");
    }

    submitFeedback({
      sentiment: updatedSentiment,
      comment: data.comment,
      category: filteredCategories,
    });

    setSentiment(updatedSentiment);
    setComment(data.comment);
    setCategories(filteredCategories);
    setShowFeedback(false);
    toast.success("Thank you for your feedback!");
  };

  return {
    isCopied,
    handleCopy,
    sentiment,
    categories,
    comment,
    handleLike,
    handleDislike,
    handleFeedbackSubmit,
    showFeedback,
    setShowFeedback,
    showJson,
    setShowJson,
    isRootUser,
    showTokenUsageSheet,
    setShowTokenUsageSheet,
  };
}
