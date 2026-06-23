import { TypedUseSelectorHook, useSelector } from "react-redux";
import mailboxPollingReducer from "./settings/mailbox-polling/mailbox-events-slice";
import emailSliceReducer from "./settings/mailbox-polling/mailbox-data-slice";
import sheetTriggerReducer from "./common/sheet-event-slice";
import classGroupSliceDataReducer from "./settings/class-group/classgroup-data-slice";
import classGroupEventReducer from "./settings/class-group/classgroup-events-slice";
import userGroupEventReducer from "./settings/user-group/user-group-events-slice";
import userGroupDataReducer from "./settings/user-group/user-group-data-slice";
import searchDataReducer from "./common/search-data-slice";
import dataTemplateEventReducer from "./settings/data-template/data-template-events-slice";
import DataTemplateSliceReducer from "./settings/data-template/data-template-slice";
import teamMembersEventsReducer from "./settings/team-members/team-members-event-slice";
import teamMembersReducer from "./settings/team-members/team-members-slice";
import agentBasicInfoReducer from "./agents/create-agents-data-slice";
import agentOutputReducer from "./agents/create-agents-data-slice";
import agentPlanningReducer from "./agents/create-agents-data-slice";
import agentRulesReducer from "./agents/create-agents-data-slice";
import agentDataTemplateReducer from "./agents/create-agents-data-slice";
import toolsEventReducer from "./agents/create-agents-data-slice";
import toolsSelectionReducer from "./agents/create-agents-data-slice";
import agentKnowledgeReducer from "./agents/create-agents-data-slice";
import toolsFiltersReducer from "./tools/tools-data-slice";
import functionFiltersReducer from "./tools/tools-data-slice";
import toolsDataReducer from "./tools/tools-data-slice";
import resetFilterReducer from "./tools/tools-data-slice";
import triggerToolUpdateReducer from "./tools/tools-data-slice";

import userDetailsReducer from "./common/user-details-slice";
import configReducer from "./config/config-slice";
import refreshDataReduce from "./common/refresh-data-slice";
import intervalDataReduce from "./common/interval-data-slice";
import rolesReducer from "./settings/roles/role-event-slice";
import rolesDataReducer from "./settings/roles/roles-data-slice";
import dateRangeReducer from "./dashboard/dashboard-filter-data-slice";
import dashboardFilterReducer from "./dashboard/dashboard-filter-data-slice";
import conditionalPermissionReducer from "./common/conditional-permissions-slice";
import { configureStore } from "@reduxjs/toolkit";
import searchAgentReducer from "./agents/agent-search-slice";
import searchReducer from "./common/search-slice";
import modalReducer from "./common/modal-slice";
import collectionsReducer from "./knowledge/collections-slice";
import inboxFiltersReducer from "./new-inbox/inbox-filters-slice";
import inboxEmailReducer from "./new-inbox/inbox-email-slice";
import chatReducer from "./assistant/chat/chat-slice";
import collectionReducer from "./assistant/chat/collection-slice";
import taskCollectionReducer from "./assistant/task/collection-slice";
import attachmentReducer from "./assistant/chat/attachment-slice";
import webSearchReducer from "./assistant/chat/web-search-slice";
import taskWebSearchReducer from "./assistant/task/task-web-search-slice";
import agentBuilderFormReducer from "./agents/agent-builder-Slice";
import issuesFiltersReducer from "./issues/issues-filters-slice";
import themeSlice from "./app-theme/theme-slice";

export const store = configureStore({
  reducer: {
    mailboxPollingReducer,
    emailSliceReducer,
    sheetTriggerReducer,
    classGroupSliceDataReducer,
    classGroupEventReducer,
    userGroupEventReducer,
    userGroupDataReducer,
    searchDataReducer,
    dataTemplateEventReducer,
    DataTemplateSliceReducer,
    teamMembersEventsReducer,
    teamMembersReducer,
    toolsSelectionReducer,
    agentBasicInfoReducer,
    agentOutputReducer,
    agentPlanningReducer,
    agentRulesReducer,
    agentDataTemplateReducer,
    toolsDataReducer,
    toolsEventReducer,
    agentKnowledgeReducer,
    toolsFiltersReducer,
    functionFiltersReducer,
    resetFilterReducer,
    triggerToolUpdateReducer,
    userDetailsReducer,
    configReducer,
    refreshDataReduce,
    intervalDataReduce,
    rolesReducer,
    rolesDataReducer,
    conditionalPermissionReducer,
    dateRangeReducer,
    dashboardFilterReducer,
    searchAgentReducer,
    searchReducer,
    modalReducer,
    collectionsReducer,
    inboxFiltersReducer,
    inboxEmailReducer,

    // app theme
    themeSlice,

    // New reducers for RAG
    chatReducer,
    collectionReducer,
    taskCollectionReducer,
    attachmentReducer,
    // conditionalPermissionReducer,
    webSearchReducer,
    taskWebSearchReducer,
    agentBuilderFormReducer,
    // userDetailsReducer,
    issuesFilters: issuesFiltersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
