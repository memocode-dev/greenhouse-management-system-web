import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {useDeleteHouseSection, useFindAllHouseSections} from "@/openapi/api/houses/houses";
import {useContext, useEffect, useState} from "react";
import {ModalContext, ModalTypes} from "@/context/ModalConext";
import HouseSectionCreateModal from "@/components/admin/house/section/HouseSectionCreateModal";
import HouseSection from "@/components/admin/house/section/HouseSection";
import HouseSectionSensorCreateModal from "@/components/admin/house/section/HouseSectionSensorCreateModal";
import {toast} from "@/components/ui/use-toast";
import {sleep} from "@/utils/sleep";

interface HouseSectionsProps {
    houseId: string;
}

const HouseSections = ({houseId}: HouseSectionsProps) => {

    const {openModal} = useContext(ModalContext);
    const [createdHouseSectionId, setCreatedHouseSectionId] = useState<string>(); // 새로 생성된 동 id

    const {isError, isLoading, data: houseSectionsArrayData, refetch: findAllHouseSectionsRefetch} =
        useFindAllHouseSections(houseId, {
            query: {
                queryKey: ['HouseSections', houseId],
            },
        });
    const houseSections = houseSectionsArrayData?.houseSections;

    const {mutate: deleteHouseSection} = useDeleteHouseSection({
        mutation: {
            onSuccess: async () => {
                const maxRetries = 10;
                let retries = 0;
                const houseSectionsLength = houseSections?.length;

                while (retries < maxRetries && houseSectionsLength === houseSections?.length) {
                    await findAllHouseSectionsRefetch();
                    await sleep(1000);
                    retries++;
                }

                toast({description: "성공적으로 하우스 동이 삭제되었습니다."});

            },
            onError: (error) => {
                const errorData = error.response?.data as { code: string; message: string }
                if (errorData.code === "NOT_FOUND_HOUSE_SECTION") {
                    return (
                        toast({
                            variant: "destructive",
                            title: "하우스 동 삭제에 실패하였습니다.",
                            description: errorData.message,
                        })
                    )
                }

                console.log(error);
                toast({
                    variant: "destructive",
                    title: "하우스 동 삭제에 실패하였습니다.",
                    description: "관리자에게 문의하세요.",
                })
            },
        }
    })

    const onDeleteSubmit = (houseSectionId: string) => deleteHouseSection({
        houseId: houseId,
        houseSectionId: houseSectionId
    });

    if (isError) {
        return (
            <div className="flex space-x-4">
                <div>잠시후에 다시 시도해주세요</div>
                <Button onClick={() => findAllHouseSectionsRefetch()}>재시도</Button>
            </div>
        )
    }

    // 5초마다 하우스 동 전체조회
    useEffect(() => {
        const intervalId = setInterval(() => {
            findAllHouseSectionsRefetch();
        }, 5000);

        return () => clearInterval(intervalId); // 해당 페이지에서 나가면 타이머 정리
    }, [findAllHouseSectionsRefetch]);

    return (
        <>
            <Card className="w-full">
                <CardHeader className="flex sm:flex-row items-center justify-between space-y-5 sm:space-y-0">
                    <CardTitle>하우스 동</CardTitle>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            className="hover:bg-primary hover:text-primary-foreground"
                            onClick={() => openModal({
                                name: ModalTypes.HOUSE_SECTION_CREATE,
                                data: {
                                    houseId: houseId,
                                    setCreatedHouseSectionId: setCreatedHouseSectionId,
                                }
                            })}
                        >
                            하우스 동 생성
                        </Button>

                        <Button
                            variant="secondary"
                            className="hover:bg-primary hover:text-primary-foreground"
                            onClick={() => openModal({
                                name: ModalTypes.HOUSE_SECTION_SENSOR_CREATE,
                                data: houseId,
                            })}
                        >
                            하우스 동 센서 생성
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>

                    {houseSections?.length === 0 &&
                        <div className="py-10 text-muted-foreground text-center">하우스 동이 없습니다.</div>
                    }

                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12 sm:py-5 px-5">
                        {houseSections?.map((houseSection, index) => {
                            return (
                                <div
                                    className={`flex flex-col ${createdHouseSectionId === houseSection.id ? 'slide-in-up' : ''}`}
                                    key={index}>
                                    <HouseSection
                                        houseSection={houseSection}
                                        houseId={houseId}
                                        onDeleteSubmit={onDeleteSubmit}
                                    />
                                </div>
                            )
                        })}

                        {isLoading &&
                            Array.from({length: 10}, (_, index) => (
                                <Skeleton key={index} className="min-h-[380px]"/>
                            ))
                        }
                    </div>
                </CardContent>
            </Card>

            <HouseSectionCreateModal/>
            <HouseSectionSensorCreateModal/>
        </>
    )
}

export default HouseSections;