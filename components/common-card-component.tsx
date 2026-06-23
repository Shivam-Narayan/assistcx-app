import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CommonCardComponentProps {
  cardTitle: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

const CommonCardComponent = ({
  cardTitle,
  children,
  headerRight,
}: CommonCardComponentProps) => {
  return (
    <div>
      <Card className="rounded-lg border bg-card text-card-foreground shadow-none p-0 gap-0">
        <CardHeader className="border-b !px-4 !py-4 flex flex-row items-center justify-between space-y-0 ">
          <CardTitle
            className="flex gap-3 items-center text-lg font-medium 
           leading-none tracking-tight"
          >
            <span>{cardTitle}</span>
          </CardTitle>
          {headerRight && <div className="mr-4">{headerRight}</div>}
        </CardHeader>
        <CardContent className="p-0 flex flex-col">{children}</CardContent>
      </Card>
    </div>
  );
};

export default CommonCardComponent;
