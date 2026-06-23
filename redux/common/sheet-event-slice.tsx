import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SheetEvents = {
     sheetEvent: boolean;
};

type InitialState = {
     value: SheetEvents;
};

const initialState: InitialState = {
     value: {
          sheetEvent: false,
     },
};

const sheetTriggerEvent = createSlice({
     name: "sheetTriggerEvent",
     initialState,
     reducers: {
          handleSheetEvents: (state, action: PayloadAction<boolean>) => {
               return {
                    value: {
                         sheetEvent: action.payload,
                    },
               };
          },
     },
});

export const { handleSheetEvents } = sheetTriggerEvent.actions;
export default sheetTriggerEvent.reducer;
