export const BoxLayout: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`px-4 md:max-w-screen-md md:mx-auto ${className}`}>
      {children}
    </div>
  );
};
