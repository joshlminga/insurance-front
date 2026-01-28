import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { TReusablePageProps } from "@/types/types";
import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";

const formatSegment = (segment: string) => {
    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BreadCrumbComponent = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <div className="w-auto">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathSegments.map((segment, index) => {
                        const href = '/' + pathSegments.slice(0, index + 1).join('/');
                        const isLast = index === pathSegments.length - 1;
                        const title = formatSegment(segment);

                        return (
                            <Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to={href}>{title}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export const ReusablePageTitle = ({
    children = null,
    description,
    title,
}: TReusablePageProps) => {
    return (
        <>
            <title>{`${title} - Accensure Insurance Marketplace`}</title>
            {description && <meta name="description" content={description} />}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-primary font-semibold text-xl leading-8">
                            {title}
                        </p>
                        <p className="font-normal text-base leading-7">
                            {description}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <BreadCrumbComponent />
                    </div>
                </div>
                {children && <div className="w-fit self-end">{children}</div>}
            </div>
        </>
    );
};
