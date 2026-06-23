import React from "react";

const ExecutionLoader = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-6 px-4">
        {/* Animated spinner */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <div
            className="absolute inset-2 border-4 border-transparent border-t-blue-400 dark:border-t-blue-500 rounded-full animate-spin"
            style={{
              animationDuration: "1.5s",
              animationDirection: "reverse",
            }}
          ></div>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Executing Task
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Preparing execution logs and output...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutionLoader;
