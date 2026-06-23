interface JumpingLoadingAnimationProps {
  color: string;
  className?: string;
}

export const JumpingLoadingAnimation = ({
  color,
  className = "",
}: JumpingLoadingAnimationProps) => {
  return (
    <span className="">
      <div
        className={`loader ${
          className || "w-4 h-4"
        } rounded-full animate-pulse ${color}`}
      ></div>
    </span>
  );
};
