const Loading = () => {
  return (
    <div role="status" className="flex flex-col gap-3 px-6 w-full">
      <div className="flex items-center justify-between py-5 w-full">
        <h2 className="text-3xl font-semibold tracking-tight">Task Issues</h2>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-56" />
          <div className="h-8 bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-32" />
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
