import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/dev/core";
import { POST_COMPARISON_DATA } from "@/utils/enums";
import { ArrowDown, MoveLeft } from "lucide-react";
import React from "react";

export const PostComparisonPage = () => {
  return (
    <div>
      <h1 className="flex items-center gap-2 px-3 text-2xl font-bold mb-6">
        <Button
          type="button"
          className="rounded-md p-1 bg-transparent hover:bg-muted"
          leftIcon={<MoveLeft className="h-7 w-7 text-primary" />}
        />
        Click preferred Insurers to Compare
      </h1>

      {/* GRID OF 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {POST_COMPARISON_DATA.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader className="flex items-center justify-center py-6">
              <img
                src={item.logo}
                alt="insurer"
                className="w-36 h-16 object-contain"
              />
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-3">
                <span className="text-muted-foreground">Basic Premium</span>
                <span className="font-medium text-right">
                  {item.premiums.basic}
                </span>

                {item.coverages.map((cov, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-muted-foreground">{cov.label}</span>
                    <Badge
                      className="justify-self-end"
                      style={{ backgroundColor: cov.color }}
                    >
                      {cov.status}
                    </Badge>
                  </React.Fragment>
                ))}

                <span className="text-muted-foreground">
                  PHCF, TL & Stamp Duty
                </span>
                <span className="font-medium text-right">
                  {item.premiums.duties}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 font-semibold">
                <span>Total Premium</span>
                <span className="text-right">
                  {item.premiums.total}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CardFooter className="flex justify-end mt-8">
        <Button
          type="button"
          className="bg-[#C20C0C] hover:bg-[#C20C0C]/70"
          leftIcon={<ArrowDown />}>
          Download Comparison
        </Button>
      </CardFooter>
    </div>
  );
};
