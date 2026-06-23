let builderAgentData: any = null;

export const setBuilderAgentData = (data: any) => {
  builderAgentData = data;
};

export const getBuilderAgentData = () => {
  return builderAgentData;
};

export const clearBuilderAgentData = () => {
  builderAgentData = null;
};
