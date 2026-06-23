import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  const heights = [10, 15, 7, 12, 10, 9, 20, 10, 5];

  const cardRender = () => {
    const cards = [];
    for (let i = 0; i < 4; i++) {
      cards.push(
        <Card key={i}>
          <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
            <div className="h-[10px] bg-card-foreground/20 rounded dark:bg-primary w-24 mb-2.5" />
            <div className="w-[20px] h-4 bg-card-foreground/20 rounded-[3px] dark:bg-primary mb-2.5" />
          </CardHeader>
          <CardContent>
            <div>
              <div className="h-[25px] bg-card-foreground/20 rounded-md dark:bg-primary w-24 mb-2.5" />
              <div className="w-32 h-2 bg-card-foreground/20 rounded dark:bg-primary" />
            </div>
          </CardContent>
        </Card>
      );
    }
    return cards;
  };
  const listRender = () => {
    const lists = [];
    for (let i = 0; i < 4; i++) {
      lists.push(
        <div className="flex items-center justify-between" key={i}>
          <div className="flex items-center mt-1">
            <div className="h-12 w-12 rounded-full me-3 bg-card-foreground/20 dark:bg-card-foreground/10" />
            <div>
              <div className="h-3 bg-card-foreground/20 rounded dark:bg-card-foreground/10 w-32 mb-2"></div>
              <div className="w-48 h-2 bg-card-foreground/20 rounded dark:bg-card-foreground/10"></div>
            </div>
          </div>
          <div className="h-[26px] bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-[100px]"></div>
        </div>
      );
    }
    return lists;
  };

  return (
    <>
      <div className="flex flex-col shadow-sm w-[-webkit-fill-available]! min-h-screen">
        <div className="flex-1 space-y-5 px-8 py-6">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
            <div className="flex items-center animate-pulse">
              <div>
                <div className="h-[36px] bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-[99px] mb-2.5" />
              </div>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pb-4">
              {cardRender()}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-2 lg:col-span-4">
                <CardHeader>
                  <CardTitle>
                    <div className="h-[20px] bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-24 mb-2.5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="min-w-0 w-full h-[350px]">
                    <div className="flex items-baseline mt-4 justify-center relative cursor-default h-[350px] w-[327px]  md:w-full md:h-full">
                      {heights?.map((height, index) => (
                        <div
                          key={index}
                          className={`w-12 ${index > 0 ? "ms-6" : ""
                            } bg-card-foreground/20 rounded-t-lg dark:bg-card-foreground/10`}
                          style={{ height: `${height}rem` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-2 lg:col-span-3">
                <CardHeader>
                  <div>
                    <div className="h-[20px] bg-card-foreground/20 rounded-md dark:bg-card-foreground/10 w-36 mb-2.5" />
                    <div className="w-64 h-2 bg-card-foreground/20 rounded dark:bg-card-foreground/10" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">{listRender()}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
